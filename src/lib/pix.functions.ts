import { createServerFn } from "@tanstack/react-start";

type Tracking = {
  src?: string | null;
  sck?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_medium?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
};

type CreatePixInput = {
  amount: number;
  description: string;
  customerEmail: string;
  customerName?: string;
  customerDocument?: string;
  productId?: string;
  tracking?: Tracking;
};

type CreatePixResult = {
  ok: boolean;
  id?: string;
  pixCopyPaste?: string;
  qrCodeBase64?: string;
  expiresAt?: string;
  error?: string;
};

type YuvexPayErrorBody = {
  error?: string | { code?: string; message?: string; details?: unknown };
  message?: string;
  code?: string;
};

const getYuvexPayErrorMessage = (status: number, json: YuvexPayErrorBody | null) => {
  const nested = typeof json?.error === "object" ? json.error : null;
  const directError = typeof json?.error === "string" ? json.error : undefined;
  const code = nested?.code || json?.code;
  const message = nested?.message || json?.message || directError;

  if (code === "PAYMENT_CREATION_BLOCKED") {
    return "A conta YuvexPay ainda não está liberada para criar Pix em produção.";
  }
  if (code === "FORBIDDEN" || code === "IP_NOT_ALLOWED") {
    return "A chave YuvexPay foi recusada por permissão, escopo ou liberação de IP.";
  }

  return message || `Falha ao criar Pix (${status})`;
};

export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((input: CreatePixInput) => {
    if (!input || typeof input.amount !== "number" || input.amount <= 0) {
      throw new Error("amount inválido");
    }
    if (!input.customerEmail || !input.customerEmail.includes("@")) {
      throw new Error("email inválido");
    }
    return {
      amount: Math.round(input.amount * 100) / 100,
      description: String(input.description ?? "Assinatura").slice(0, 140),
      customerEmail: input.customerEmail.trim(),
      customerName: input.customerName?.trim() || "Cliente",
      customerDocument: input.customerDocument?.replace(/\D/g, "") || undefined,
      productId: input.productId?.trim() || "subscription",
      tracking: input.tracking ?? {},
    };
  })
  .handler(async ({ data }): Promise<CreatePixResult> => {
    const apiKey = process.env.YUVEXPAY_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "YUVEXPAY_API_KEY ausente" };
    }

    const idempotencyKey = `pix-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const body: Record<string, unknown> = {
      amount: data.amount,
      methods: ["PIX"],
      currency: "BRL",
      mode: "headless",
      description: data.description,
      externalId: idempotencyKey,
      expiresInMinutes: 30,
      customer: {
        name: data.customerName,
        email: data.customerEmail,
        ...(data.customerDocument ? { document: data.customerDocument } : {}),
      },
    };

    try {
      const res = await fetch("https://api.yuvexpay.com/v1/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(body),
      });

      const rawText = await res.text();
      let json: ({
        payment?: {
          id?: string;
          expiresAt?: string;
          methodData?: { pixCopyPaste?: string; qrCodeBase64?: string };
        };
      } & YuvexPayErrorBody) | null = null;
      try {
        json = rawText ? JSON.parse(rawText) : null;
      } catch {
        json = null;
      }

      if (!res.ok || !json?.payment?.methodData?.pixCopyPaste) {
        console.error("YuvexPay error", res.status, "body:", rawText?.slice(0, 500));
        return {
          ok: false,
          error: getYuvexPayErrorMessage(res.status, json),
        };
      }

      const paymentId = json.payment.id || idempotencyKey;
      const amountCents = Math.round(data.amount * 100);

      // Persist + track as pending in Utmify (best-effort; never block the Pix response)
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("utmify_orders")
          .upsert(
            {
              payment_id: paymentId,
              amount_cents: amountCents,
              customer: {
                name: data.customerName,
                email: data.customerEmail,
                document: data.customerDocument ?? null,
              },
              product: { id: data.productId, name: data.description },
              tracking: data.tracking,
              status: "waiting_payment",
            },
            { onConflict: "payment_id" },
          );

        const { sendUtmifyOrder } = await import("./utmify.server");
        await sendUtmifyOrder({
          orderId: paymentId,
          status: "waiting_payment",
          createdAt: new Date(),
          amountCents,
          customer: {
            name: data.customerName,
            email: data.customerEmail,
            document: data.customerDocument,
          },
          product: { id: data.productId, name: data.description },
          tracking: data.tracking,
        });
      } catch (err) {
        console.error("Utmify pending tracking failed", err);
      }

      return {
        ok: true,
        id: paymentId,
        pixCopyPaste: json.payment.methodData.pixCopyPaste,
        qrCodeBase64: json.payment.methodData.qrCodeBase64,
        expiresAt: json.payment.expiresAt,
      };
    } catch (err) {
      console.error("YuvexPay request failed", err);
      return { ok: false, error: "Erro de rede ao contatar a YuvexPay" };
    }
  });
