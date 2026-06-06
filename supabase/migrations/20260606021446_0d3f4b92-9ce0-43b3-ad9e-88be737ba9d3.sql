-- Add tool_only flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tool_only boolean NOT NULL DEFAULT false;

-- Extend personal_ai_profile with onboarding fields
ALTER TABLE public.personal_ai_profile
  ADD COLUMN IF NOT EXISTS use_cases text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS about_me text,
  ADD COLUMN IF NOT EXISTS response_prefs jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS voice_profile jsonb,
  ADD COLUMN IF NOT EXISTS voice_samples text[],
  ADD COLUMN IF NOT EXISTS setup_completed_at timestamptz;

-- Helper to check tool_only status without recursion
CREATE OR REPLACE FUNCTION public.is_tool_only(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT tool_only FROM public.profiles WHERE id = _user_id), false)
$$;