
CREATE TABLE public.compass_locker_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('text','file')),
  title text,
  content text,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX compass_locker_items_user_created_idx
  ON public.compass_locker_items (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.compass_locker_items TO authenticated;
GRANT ALL ON public.compass_locker_items TO service_role;

ALTER TABLE public.compass_locker_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins read own locker items"
  ON public.compass_locker_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins insert own locker items"
  ON public.compass_locker_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins update own locker items"
  ON public.compass_locker_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins delete own locker items"
  ON public.compass_locker_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'super_admin'));

-- Storage policies on compass-artifacts: user-owned files under "{uid}/locker/..."
CREATE POLICY "Locker users read own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'compass-artifacts'
    AND public.has_role(auth.uid(), 'super_admin')
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'locker'
  );

CREATE POLICY "Locker users upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'compass-artifacts'
    AND public.has_role(auth.uid(), 'super_admin')
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'locker'
  );

CREATE POLICY "Locker users delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'compass-artifacts'
    AND public.has_role(auth.uid(), 'super_admin')
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'locker'
  );
