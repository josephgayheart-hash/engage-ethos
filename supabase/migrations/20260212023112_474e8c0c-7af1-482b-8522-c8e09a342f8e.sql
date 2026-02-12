
-- Phase 1a: Add missing columns to shared_templates
ALTER TABLE public.shared_templates
  ADD COLUMN IF NOT EXISTS institutional_profile_id uuid REFERENCES public.institutional_profiles(id),
  ADD COLUMN IF NOT EXISTS college_name text,
  ADD COLUMN IF NOT EXISTS department_name text,
  ADD COLUMN IF NOT EXISTS change_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_by_name text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

-- Phase 1b: Add missing columns to personal_messages
ALTER TABLE public.personal_messages
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS channels text[],
  ADD COLUMN IF NOT EXISTS channel_drafts jsonb,
  ADD COLUMN IF NOT EXISTS cohort jsonb,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS versions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS submitted_to_library boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by_name text,
  ADD COLUMN IF NOT EXISTS remixed_from jsonb;

-- Phase 1c: Create library_usage_events table
CREATE TABLE public.library_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  user_id uuid NOT NULL,
  template_id uuid REFERENCES public.shared_templates(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.personal_messages(id) ON DELETE CASCADE,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_name text
);

-- Enable RLS on library_usage_events
ALTER TABLE public.library_usage_events ENABLE ROW LEVEL SECURITY;

-- RLS: Users can insert their own usage events
CREATE POLICY "Users can insert their own usage events"
  ON public.library_usage_events
  FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

-- RLS: Users can view their own usage events
CREATE POLICY "Users can view their own usage events"
  ON public.library_usage_events
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS: Admins can view tenant usage events
CREATE POLICY "Admins can view tenant usage events"
  ON public.library_usage_events
  FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- RLS: Super admins can view all usage events
CREATE POLICY "Super admins can view all usage events"
  ON public.library_usage_events
  FOR SELECT
  USING (is_super_admin(auth.uid()));

-- Add indexes for performance
CREATE INDEX idx_library_usage_events_template ON public.library_usage_events(template_id);
CREATE INDEX idx_library_usage_events_message ON public.library_usage_events(message_id);
CREATE INDEX idx_library_usage_events_tenant ON public.library_usage_events(tenant_id);
CREATE INDEX idx_shared_templates_tags ON public.shared_templates USING GIN(tags);
CREATE INDEX idx_personal_messages_tags ON public.personal_messages USING GIN(tags);
