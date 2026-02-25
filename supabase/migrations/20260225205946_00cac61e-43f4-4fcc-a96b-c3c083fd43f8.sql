-- Add indexes for personal_messages performance
CREATE INDEX IF NOT EXISTS idx_personal_messages_user_id ON public.personal_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_personal_messages_tenant_id ON public.personal_messages (tenant_id);
CREATE INDEX IF NOT EXISTS idx_personal_messages_user_created ON public.personal_messages (user_id, created_at DESC);

-- Drop the old overly-broad SELECT policy and replace with user_id-based one
DROP POLICY IF EXISTS "Users can view personal messages in their tenant" ON public.personal_messages;
CREATE POLICY "Users can view their own personal messages"
  ON public.personal_messages FOR SELECT
  USING (user_id = auth.uid());