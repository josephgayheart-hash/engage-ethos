
CREATE TABLE public.personal_ai_threads (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New chat',
  model text NOT NULL DEFAULT '',
  system_prompt text NOT NULL DEFAULT '',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX personal_ai_threads_user_updated_idx
  ON public.personal_ai_threads (user_id, updated_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_ai_threads TO authenticated;
GRANT ALL ON public.personal_ai_threads TO service_role;

ALTER TABLE public.personal_ai_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own threads"
  ON public.personal_ai_threads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own threads"
  ON public.personal_ai_threads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own threads"
  ON public.personal_ai_threads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own threads"
  ON public.personal_ai_threads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER personal_ai_threads_updated_at
  BEFORE UPDATE ON public.personal_ai_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
