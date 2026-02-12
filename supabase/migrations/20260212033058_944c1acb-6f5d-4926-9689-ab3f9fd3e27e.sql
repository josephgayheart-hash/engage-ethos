-- Add creator name to library_collections
ALTER TABLE public.library_collections
ADD COLUMN created_by_name text;
