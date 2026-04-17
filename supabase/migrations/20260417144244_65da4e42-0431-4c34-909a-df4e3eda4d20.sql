-- Enums for status, type and resolution
CREATE TYPE public.request_status AS ENUM ('pending', 'awaiting_shipment', 'received', 'completed', 'rejected');
CREATE TYPE public.request_type AS ENUM ('exchange', 'return');
CREATE TYPE public.request_resolution AS ENUM ('refund', 'voucher', 'exchange');

-- Main return requests table
CREATE TABLE public.return_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  type public.request_type NOT NULL,
  resolution public.request_resolution NOT NULL,
  tracking_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Items for each return request
CREATE TABLE public.return_request_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_sku TEXT,
  size TEXT,
  color TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_return_requests_status ON public.return_requests(status);
CREATE INDEX idx_return_requests_created_at ON public.return_requests(created_at DESC);
CREATE INDEX idx_return_request_items_request_id ON public.return_request_items(request_id);

-- Enable RLS
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_request_items ENABLE ROW LEVEL SECURITY;

-- Helper: is user admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::app_role, 'super_admin'::app_role)
  )
$$;

-- Policies: return_requests
CREATE POLICY "Anyone can create return requests"
ON public.return_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all requests"
ON public.return_requests FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update requests"
ON public.return_requests FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete requests"
ON public.return_requests FOR DELETE
USING (public.is_admin(auth.uid()));

-- Policies: return_request_items
CREATE POLICY "Anyone can create request items"
ON public.return_request_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all items"
ON public.return_request_items FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update items"
ON public.return_request_items FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete items"
ON public.return_request_items FOR DELETE
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_return_requests_updated_at
BEFORE UPDATE ON public.return_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();