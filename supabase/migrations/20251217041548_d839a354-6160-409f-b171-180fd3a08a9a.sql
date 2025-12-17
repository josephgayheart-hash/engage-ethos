-- Allow super admins to insert tenants
CREATE POLICY "Super admins can create tenants"
ON public.tenants
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Allow super admins to insert institutional config
CREATE POLICY "Super admins can create institutional config"
ON public.institutional_config
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Create beta feedback table
CREATE TABLE public.beta_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  user_id UUID NOT NULL,
  feature_area TEXT NOT NULL,
  page_path TEXT,
  feedback_type TEXT NOT NULL DEFAULT 'general',
  feedback_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Users can submit feedback
CREATE POLICY "Users can submit feedback"
ON public.beta_feedback
FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.beta_feedback
FOR SELECT
USING (user_id = auth.uid());

-- Super admins can view all feedback
CREATE POLICY "Super admins can view all feedback"
ON public.beta_feedback
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Super admins can update feedback (for status, notes)
CREATE POLICY "Super admins can update feedback"
ON public.beta_feedback
FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Create index for efficient queries
CREATE INDEX idx_beta_feedback_tenant ON public.beta_feedback(tenant_id);
CREATE INDEX idx_beta_feedback_status ON public.beta_feedback(status);
CREATE INDEX idx_beta_feedback_created ON public.beta_feedback(created_at DESC);