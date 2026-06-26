CREATE TABLE public.utmify_orders (
  payment_id text PRIMARY KEY,
  amount_cents integer NOT NULL,
  customer jsonb NOT NULL,
  product jsonb NOT NULL,
  tracking jsonb NOT NULL,
  status text NOT NULL DEFAULT 'waiting_payment',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

GRANT ALL ON public.utmify_orders TO service_role;

ALTER TABLE public.utmify_orders ENABLE ROW LEVEL SECURITY;