import { createServerFn } from "@tanstack/react-start";

export const getPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { paymentId: string }) => ({
    paymentId: String(input?.paymentId ?? "").trim(),
  }))
  .handler(async ({ data }): Promise<{ status: string | null }> => {
    if (!data.paymentId) return { status: null };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("utmify_orders")
        .select("status")
        .eq("payment_id", data.paymentId)
        .maybeSingle();
      return { status: (row?.status as string | null) ?? null };
    } catch (err) {
      console.error("getPaymentStatus failed", err);
      return { status: null };
    }
  });
