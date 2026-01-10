-- Allow Web Content Analyzer drafts to be saved
-- Existing constraint only permits 'message' and 'journey'
ALTER TABLE public.user_drafts
  DROP CONSTRAINT IF EXISTS user_drafts_draft_type_check;

ALTER TABLE public.user_drafts
  ADD CONSTRAINT user_drafts_draft_type_check
  CHECK (draft_type = ANY (ARRAY['message'::text, 'journey'::text, 'analysis'::text]));