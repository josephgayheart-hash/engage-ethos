-- Add cover_image_url to personal_messages
ALTER TABLE public.personal_messages
ADD COLUMN cover_image_url text;

-- Add cover_image_url to user_drafts
ALTER TABLE public.user_drafts
ADD COLUMN cover_image_url text;