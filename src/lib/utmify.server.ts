type Tracking = {
  src?: string | null;
  sck?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_medium?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
};

export type UtmifyOrderInput = {
  orderId: string;
  status: "waiting_payment" | "paid" | "refused" | "refunded" | "chargedback";
  createdAt: Date;
  approvedAt?: Date | null;
  amountCents: number;
  customer: {
    name: string;
    email: string;
    document?: string | null;
    phone?: string | null;
    ip?: string | null;
  };
  product: { id: string; name: string; quantity?: number };
  tracking: Tracking;
};

function fmt(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

export async function sendUtmifyOrder(input: UtmifyOrderInput) {
  const token = process.env.UTMIFY_API_TOKEN;
  if (!token) {
    console.warn("UTMIFY_API_TOKEN ausente; pedido não enviado para Utmify");
    return;
  }
  const body = {
    orderId: input.orderId,
    platform: "YuvexPay",
    paymentMethod: "pix",
    status: input.status,
    createdAt: fmt(input.createdAt),
    approvedDate: input.approvedAt ? fmt(input.approvedAt) : null,
    refundedAt: null,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone ?? null,
      document: input.customer.document ?? null,
      country: "BR",
      ip: input.customer.ip ?? null,
    },
    products: [
      {
        id: input.product.id,
        name: input.product.name,
        planId: null,
        planName: null,
        quantity: input.product.quantity ?? 1,
        priceInCents: input.amountCents,
      },
    ],
    trackingParameters: {
      src: input.tracking.src ?? null,
      sck: input.tracking.sck ?? null,
      utm_source: input.tracking.utm_source ?? null,
      utm_campaign: input.tracking.utm_campaign ?? null,
      utm_medium: input.tracking.utm_medium ?? null,
      utm_content: input.tracking.utm_content ?? null,
      utm_term: input.tracking.utm_term ?? null,
    },
    commission: {
      totalPriceInCents: input.amountCents,
      gatewayFeeInCents: 0,
      userCommissionInCents: input.amountCents,
    },
    isTest: false,
  };
  try {
    const r = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: { "x-api-token": token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      console.error("Utmify error", r.status, text);
    }
  } catch (e) {
    console.error("Utmify network error", e);
  }
}
