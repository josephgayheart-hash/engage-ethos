-- Create user_drafts table for auto-saving messages and journeys
CREATE TABLE public.user_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  draft_type TEXT NOT NULL CHECK (draft_type IN ('message', 'journey')),
  title TEXT,
  draft_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_drafts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own drafts
CREATE POLICY "Users can view their own drafts"
ON public.user_drafts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own drafts
CREATE POLICY "Users can create their own drafts"
ON public.user_drafts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update their own drafts"
ON public.user_drafts
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete their own drafts"
ON public.user_drafts
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_drafts_user_id ON public.user_drafts(user_id);
CREATE INDEX idx_user_drafts_type ON public.user_drafts(draft_type);

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_drafts_updated_at
BEFORE UPDATE ON public.user_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();