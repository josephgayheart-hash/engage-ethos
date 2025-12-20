-- Add additional columns to email_nudges for better tracking
ALTER TABLE public.email_nudges 
ADD COLUMN IF NOT EXISTS recipient_email text,
ADD COLUMN IF NOT EXISTS recipient_name text,
ADD COLUMN IF NOT EXISTS subject text,
ADD COLUMN IF NOT EXISTS email_type text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;