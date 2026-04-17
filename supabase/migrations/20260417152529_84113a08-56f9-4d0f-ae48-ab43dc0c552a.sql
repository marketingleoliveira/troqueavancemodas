-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_cpf TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC,
  shipping NUMERIC,
  financial_status TEXT,
  fulfillment_status TEXT,
  order_date TIMESTAMPTZ,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_email ON public.orders(customer_email);
CREATE INDEX idx_orders_phone ON public.orders(customer_phone);

-- Order items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  variant TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS: admins full access
CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins manage order items" ON public.order_items
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Authenticated users can read orders (for validation in portal)
CREATE POLICY "Authenticated can read orders" ON public.orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can read order items" ON public.order_items
  FOR SELECT TO authenticated USING (true);

-- Updated_at trigger
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();