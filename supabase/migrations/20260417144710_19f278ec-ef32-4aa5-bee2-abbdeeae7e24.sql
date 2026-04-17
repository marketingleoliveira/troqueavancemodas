-- 1. Add user_id to return_requests (link to authenticated user)
ALTER TABLE public.return_requests
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_return_requests_user_id ON public.return_requests(user_id);

-- Replace the open INSERT policy: only authenticated users may create, and they must own the row
DROP POLICY IF EXISTS "Anyone can create return requests" ON public.return_requests;

CREATE POLICY "Users can create their own requests"
ON public.return_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
ON public.return_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Items: lock down inserts to the request owner or admin
DROP POLICY IF EXISTS "Anyone can create request items" ON public.return_request_items;

CREATE POLICY "Users can create items for their own requests"
ON public.return_request_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.return_requests r
    WHERE r.id = request_id AND r.user_id = auth.uid()
  )
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Users can view items of their own requests"
ON public.return_request_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.return_requests r
    WHERE r.id = request_id AND r.user_id = auth.uid()
  )
);

-- 2. Chat messages
CREATE TYPE public.message_sender AS ENUM ('customer', 'admin');

CREATE TABLE public.request_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender public.message_sender NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_messages_request_id ON public.request_messages(request_id, created_at);

ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;

-- Customer can view messages of their own requests
CREATE POLICY "Customers view messages of their requests"
ON public.request_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.return_requests r
    WHERE r.id = request_id AND r.user_id = auth.uid()
  )
);

-- Admins view all
CREATE POLICY "Admins view all messages"
ON public.request_messages FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Customer can send messages on their own requests (sender must be 'customer')
CREATE POLICY "Customers send messages on their requests"
ON public.request_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender = 'customer'
  AND user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.return_requests r
    WHERE r.id = request_id AND r.user_id = auth.uid()
  )
);

-- Admins can send as 'admin'
CREATE POLICY "Admins send messages"
ON public.request_messages FOR INSERT
TO authenticated
WITH CHECK (sender = 'admin' AND public.is_admin(auth.uid()));

-- Realtime
ALTER TABLE public.request_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_messages;