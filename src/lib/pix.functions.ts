import { createServerFn } from "@tanstack/react-start";

type CreatePixInput = {
  amount: number;
  description: string;
  customerEmail: string;
  customerName?: string;
  customerDocument?: string;
};

type CreatePixResult = {
  ok: boolean;
  id?: string;
  pixCopyPaste?: string;
  qrCodeBase64?: string;
  expiresAt?: string;
  error?: string;
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

      const json = (await res.json().catch(() => null)) as
        | { payment?: { id?: string; expiresAt?: string; methodData?: { pixCopyPaste?: string; qrCodeBase64?: string } }; message?: string; error?: string }
        | null;

      if (!res.ok || !json?.payment?.methodData?.pixCopyPaste) {
        console.error("YuvexPay error", res.status, json);
        return {
          ok: false,
          error: json?.message || json?.error || `Falha ao criar Pix (${res.status})`,
        };
      }

      return {
        ok: true,
        id: json.payment.id,
        pixCopyPaste: json.payment.methodData.pixCopyPaste,
        qrCodeBase64: json.payment.methodData.qrCodeBase64,
        expiresAt: json.payment.expiresAt,
      };
    } catch (err) {
      console.error("YuvexPay request failed", err);
      return { ok: false, error: "Erro de rede ao contatar a YuvexPay" };
    }
  });
