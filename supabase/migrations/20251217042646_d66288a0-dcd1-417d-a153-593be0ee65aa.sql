-- Create personal_messages table for Personal Library
CREATE TABLE public.personal_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  channel TEXT NOT NULL,
  audience TEXT,
  domain TEXT,
  moment TEXT,
  goal TEXT,
  tone TEXT,
  sender_recommendation TEXT,
  mode TEXT,
  approved BOOLEAN DEFAULT false,
  notes TEXT,
  institutional_profile_id UUID REFERENCES public.institutional_profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shared_templates table for Shared Library
CREATE TABLE public.shared_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by_user_id UUID,
  title TEXT NOT NULL,
  intent_statement TEXT,
  content TEXT NOT NULL,
  use_cases JSONB DEFAULT '{}'::jsonb,
  placeholders JSONB DEFAULT '[]'::jsonb,
  required_fields JSONB DEFAULT '{}'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  ethical_guardrails TEXT[],
  owner TEXT,
  maintainer TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  version TEXT DEFAULT '1.0',
  approval_notes TEXT,
  playbook TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

-- Personal messages: users can only access their own tenant's messages
CREATE POLICY "Users can view personal messages in their tenant"
ON public.personal_messages FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create personal messages in their tenant"
ON public.personal_messages FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Users can update their own personal messages"
ON public.personal_messages FOR UPDATE
USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete their own personal messages"
ON public.personal_messages FOR DELETE
USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Super admins can view all personal messages"
ON public.personal_messages FOR SELECT
USING (is_super_admin(auth.uid()));

-- Shared templates: users can view their tenant's templates
CREATE POLICY "Users can view shared templates in their tenant"
ON public.shared_templates FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create shared templates in their tenant"
ON public.shared_templates FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can update shared templates in their tenant"
ON public.shared_templates FOR UPDATE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shared templates in their tenant"
ON public.shared_templates FOR DELETE
USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can view all shared templates"
ON public.shared_templates FOR SELECT
USING (is_super_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_personal_messages_updated_at
BEFORE UPDATE ON public.personal_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shared_templates_updated_at
BEFORE UPDATE ON public.shared_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();