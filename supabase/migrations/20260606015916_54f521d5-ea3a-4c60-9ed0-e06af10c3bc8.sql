
CREATE TABLE public.personal_ai_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  system_prompt TEXT NOT NULL DEFAULT '',
  memory_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_ai_profile TO authenticated;
GRANT ALL ON public.personal_ai_profile TO service_role;
ALTER TABLE public.personal_ai_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.personal_ai_profile FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_personal_ai_profile_updated BEFORE UPDATE ON public.personal_ai_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.personal_ai_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact TEXT NOT NULL,
  category TEXT,
  source_thread_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_ai_facts TO authenticated;
GRANT ALL ON public.personal_ai_facts TO service_role;
ALTER TABLE public.personal_ai_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own facts" ON public.personal_ai_facts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_personal_ai_facts_user ON public.personal_ai_facts(user_id, created_at DESC);
