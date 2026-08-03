ALTER TABLE public.request_messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;

CREATE POLICY "Admins can edit admin messages"
ON public.request_messages FOR UPDATE TO authenticated
USING (sender = 'admin'::message_sender AND public.is_admin(auth.uid()))
WITH CHECK (sender = 'admin'::message_sender AND public.is_admin(auth.uid()));

CREATE POLICY "Customers can edit their own messages"
ON public.request_messages FOR UPDATE TO authenticated
USING (sender = 'customer'::message_sender AND user_id = auth.uid())
WITH CHECK (sender = 'customer'::message_sender AND user_id = auth.uid());