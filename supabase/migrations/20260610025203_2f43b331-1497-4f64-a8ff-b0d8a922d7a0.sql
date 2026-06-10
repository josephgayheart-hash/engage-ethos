
-- Artifacts
CREATE TABLE public.personal_ai_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thread_id uuid NOT NULL REFERENCES public.personal_ai_threads(id) ON DELETE CASCADE,
  message_id uuid,
  kind text NOT NULL CHECK (kind IN ('mermaid','svg','html','react','markdown','image')),
  title text,
  source text NOT NULL,
  preview_url text,
  version int NOT NULL DEFAULT 1,
  parent_artifact_id uuid REFERENCES public.personal_ai_artifacts(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_ai_artifacts TO authenticated;
GRANT ALL ON public.personal_ai_artifacts TO service_role;
ALTER TABLE public.personal_ai_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own artifacts" ON public.personal_ai_artifacts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_personal_ai_artifacts_thread ON public.personal_ai_artifacts(thread_id, created_at DESC);
CREATE TRIGGER trg_personal_ai_artifacts_updated
  BEFORE UPDATE ON public.personal_ai_artifacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Folders
CREATE TABLE public.personal_ai_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_ai_folders TO authenticated;
GRANT ALL ON public.personal_ai_folders TO service_role;
ALTER TABLE public.personal_ai_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own folders" ON public.personal_ai_folders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_personal_ai_folders_updated
  BEFORE UPDATE ON public.personal_ai_folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Thread extras
ALTER TABLE public.personal_ai_threads
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES public.personal_ai_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS system_prompt text;
CREATE INDEX IF NOT EXISTS idx_personal_ai_threads_folder ON public.personal_ai_threads(folder_id);
