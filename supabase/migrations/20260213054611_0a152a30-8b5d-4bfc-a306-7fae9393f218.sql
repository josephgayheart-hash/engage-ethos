-- Drop the old check constraint and add one that includes 'image'
ALTER TABLE public.user_drafts DROP CONSTRAINT IF EXISTS user_drafts_draft_type_check;
ALTER TABLE public.user_drafts ADD CONSTRAINT user_drafts_draft_type_check CHECK (draft_type IN ('message', 'journey', 'analysis', 'image'));