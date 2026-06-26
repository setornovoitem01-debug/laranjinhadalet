import { createFileRoute } from "@tanstack/react-router";

type PaymentLike = {
  id?: string;
  paymentId?: string;
  status?: string;
};

type WebhookPayload = {
  event?: string;
  type?: string;
  payment?: PaymentLike;
  data?: ({ payment?: PaymentLike } & PaymentLike) | PaymentLike;
} & PaymentLike;

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
        if (token !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: WebhookPayload;
        try {
          payload = (await request.json()) as WebhookPayload;
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const dataField = (payload?.data ?? {}) as { payment?: PaymentLike } & PaymentLike;
        const payment: PaymentLike =
          payload?.payment ?? dataField.payment ?? dataField ?? payload ?? {};
        const paymentId = payment?.id || payment?.paymentId;
        const eventStr = (payload?.event || payload?.type || "").toString().toUpperCase();
        const statusStr = (payment?.status || "").toString().toUpperCase();
        const combined = `${eventStr} ${statusStr}`;

        if (!paymentId) {
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

        await supabaseAdmin
          .from("utmify_orders")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("payment_id", paymentId);

        const { sendUtmifyOrder } = await import("@/lib/utmify.server");
        await sendUtmifyOrder({
          orderId: paymentId,
          status: "paid",
          createdAt: new Date(row.created_at as string),
          approvedAt: new Date(),
          amountCents: row.amount_cents as number,
          customer: row.customer as {
            name: string;
            email: string;
            document?: string | null;
          },
          product: row.product as { id: string; name: string },
          tracking: row.tracking as Record<string, string | null>,
        });

        return new Response("ok", { status: 200 });
      },
    },
  },
});
