
CREATE TABLE public.personal_ai_edits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  final_text TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  source_message_id TEXT,
  prompt_context TEXT,
  model TEXT,
  word_count_original INTEGER NOT NULL DEFAULT 0,
  word_count_final INTEGER NOT NULL DEFAULT 0,
  words_removed TEXT[] NOT NULL DEFAULT '{}',
  words_added TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_personal_ai_edits_user_created ON public.personal_ai_edits(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_ai_edits TO authenticated;
GRANT ALL ON public.personal_ai_edits TO service_role;

ALTER TABLE public.personal_ai_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage their own edits — select"
  ON public.personal_ai_edits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins manage their own edits — insert"
  ON public.personal_ai_edits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins manage their own edits — update"
  ON public.personal_ai_edits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND public.is_super_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins manage their own edits — delete"
  ON public.personal_ai_edits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND public.is_super_admin(auth.uid()));

CREATE TRIGGER personal_ai_edits_updated_at
  BEFORE UPDATE ON public.personal_ai_edits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
