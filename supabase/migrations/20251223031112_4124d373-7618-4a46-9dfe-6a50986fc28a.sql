-- Add link_clicks column to track detailed click data per email
ALTER TABLE public.email_nudges 
ADD COLUMN IF NOT EXISTS link_clicks jsonb DEFAULT '[]'::jsonb;

-- Add index for faster lookups on provider_message_id (used for tracking)
CREATE INDEX IF NOT EXISTS idx_email_nudges_provider_message_id 
ON public.email_nudges(provider_message_id);

-- Comment for documentation
COMMENT ON COLUMN public.email_nudges.link_clicks IS 'Array of click events: [{link_name, url, clicked_at, user_agent, ip}]';