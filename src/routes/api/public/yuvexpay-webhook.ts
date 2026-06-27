import { createFileRoute } from "@tanstack/react-router";

type PaymentLike = {
  id?: string;
  paymentId?: string;
  payment_id?: string;
  externalId?: string;
  external_id?: string;
  paidAt?: string;
  paid_at?: string;
  status?: string;
};

type WebhookPayload = {
  id?: string;
  event?: string;
  type?: string;
  payment?: PaymentLike;
  data?: ({ payment?: PaymentLike } & PaymentLike) | PaymentLike;
} & PaymentLike;

const SKEW_SECONDS = 300;

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function hmacSha256Hex(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifySignature(rawBody: string, headers: Headers, secret: string) {
  const timestamp = headers.get("x-webhook-timestamp");
  const signature = headers.get("x-webhook-signature");
  const legacySignature = headers.get("x-webhook-signature-legacy");

  if (timestamp && signature) {
    const drift = Math.abs(Math.floor(Date.now() / 1000) - Number.parseInt(timestamp, 10));
    if (!Number.isFinite(drift) || drift > SKEW_SECONDS) return false;

    const expected = "v1=" + (await hmacSha256Hex(secret, `${timestamp}.${rawBody}`));
    if (constantTimeEqual(signature, expected)) return true;
  }

  if (legacySignature) {
    const expectedLegacy = await hmacSha256Hex(secret, rawBody);
    return constantTimeEqual(legacySignature.replace(/^v1=/, ""), expectedLegacy);
  }

  return false;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function firstString(source: unknown, keys: string[]) {
  const record = asRecord(source);
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function extractPaymentId(payload: WebhookPayload) {
  const data = asRecord(payload.data);
  const candidates = [
    payload.payment,
    data?.payment,
    data?.object,
    data?.paymentData,
    data,
    payload,
  ];

  for (const candidate of candidates) {
    const id = firstString(candidate, ["id", "paymentId", "payment_id"]);
    if (id && !id.startsWith("evt_")) return id;
  }

  return firstString(payload, ["paymentId", "payment_id"]);
}

function extractPaidAt(payload: WebhookPayload) {
  const data = asRecord(payload.data);
  const paidAt = firstString(data, ["paidAt", "paid_at", "approvedAt", "approved_at"]);
  const parsed = paidAt ? new Date(paidAt) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
}

export const Route = createFileRoute("/api/public/yuvexpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.YUVEXPAY_WEBHOOK_SECRET;
        if (!expected) {
          console.error("YUVEXPAY_WEBHOOK_SECRET ausente");
          return new Response("Server misconfigured", { status: 500 });
        }
        const url = new URL(request.url);
        const token =
          url.searchParams.get("token") ||
          request.headers.get("x-webhook-token") ||
          request.headers.get("x-webhook-secret");

        const rawBody = await request.text();
        const hasValidToken = token === expected;
        const hasValidSignature = await verifySignature(rawBody, request.headers, expected);
        if (!hasValidToken && !hasValidSignature) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: WebhookPayload;
        try {
          payload = JSON.parse(rawBody) as WebhookPayload;
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const dataField = (payload?.data ?? {}) as { payment?: PaymentLike } & PaymentLike;
        const payment: PaymentLike =
          payload?.payment ?? dataField.payment ?? dataField ?? payload ?? {};
        const paymentId = extractPaymentId(payload);
        const eventStr = (
          request.headers.get("x-webhook-event") ||
          payload?.event ||
          payload?.type ||
          ""
        )
          .toString()
          .toUpperCase();
        const statusStr = (payment?.status || "").toString().toUpperCase();
        const combined = `${eventStr} ${statusStr}`;

        if (!paymentId) {
          console.error("YuvexPay webhook missing payment id", rawBody.slice(0, 500));
          return new Response("Missing payment id", { status: 400 });
        }

        const isPaid = ["PAID", "APPROVED", "COMPLETED", "CONFIRMED"].some((s) =>
          combined.includes(s),
        );
        if (!isPaid) {
          return new Response("ignored", { status: 200 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row, error } = await supabaseAdmin
          .from("utmify_orders")
          .select("*")
          .eq("payment_id", paymentId)
          .maybeSingle();

        if (error) {
          console.error("utmify_orders lookup failed", error);
          return new Response("DB error", { status: 500 });
        }
        if (!row) {
          return new Response("Order not found", { status: 404 });
        }
        if (row.status === "paid") {
          return new Response("already processed", { status: 200 });
        }

        const approvedAt = extractPaidAt(payload);
        await supabaseAdmin
          .from("utmify_orders")
          .update({ status: "paid", paid_at: approvedAt.toISOString() })
          .eq("payment_id", paymentId);

        const { sendUtmifyOrder } = await import("@/lib/utmify.server");
        await sendUtmifyOrder({
          orderId: paymentId,
          status: "paid",
          createdAt: new Date(row.created_at as string),
          approvedAt,
          amountCents: row.amount_cents as number,
          customer: row.customer as {
            name: string;
            email: string;
            document?: string | null;
            ip?: string | null;
          },
          product: row.product as { id: string; name: string },
          tracking: row.tracking as Record<string, string | null>,
        });

        return new Response("ok", { status: 200 });
      },
    },
  },
});
