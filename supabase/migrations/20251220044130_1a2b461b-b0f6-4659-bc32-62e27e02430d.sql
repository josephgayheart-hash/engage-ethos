-- Fix email activity logging: remove overly strict nudge_type check constraint
ALTER TABLE public.email_nudges
  DROP CONSTRAINT IF EXISTS email_nudges_nudge_type_check;

-- Add columns for delivery tracking (Resend message id + event timestamps)
ALTER TABLE public.email_nudges
  ADD COLUMN IF NOT EXISTS provider text NULL,
  ADD COLUMN IF NOT EXISTS provider_message_id text NULL,
  ADD COLUMN IF NOT EXISTS delivery_status text NULL,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS opened_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS clicked_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS bounced_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS last_event_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS events jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_email_nudges_provider_message
  ON public.email_nudges(provider, provider_message_id);

CREATE INDEX IF NOT EXISTS idx_email_nudges_sent_at
  ON public.email_nudges(sent_at DESC);