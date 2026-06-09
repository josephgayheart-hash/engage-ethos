
-- Broaden Compass Locker access to all active authenticated users (own rows only)
DROP POLICY IF EXISTS "Super admins read own locker items" ON public.compass_locker_items;
DROP POLICY IF EXISTS "Super admins insert own locker items" ON public.compass_locker_items;
DROP POLICY IF EXISTS "Super admins update own locker items" ON public.compass_locker_items;
DROP POLICY IF EXISTS "Super admins delete own locker items" ON public.compass_locker_items;

CREATE POLICY "Users read own locker items" ON public.compass_locker_items
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.is_user_active(auth.uid()));

CREATE POLICY "Users insert own locker items" ON public.compass_locker_items
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_user_active(auth.uid()));

CREATE POLICY "Users update own locker items" ON public.compass_locker_items
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.is_user_active(auth.uid()))
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own locker items" ON public.compass_locker_items
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND public.is_user_active(auth.uid()));

-- Storage policies for compass-artifacts/{uid}/locker/*
DROP POLICY IF EXISTS "Locker users read own files" ON storage.objects;
DROP POLICY IF EXISTS "Locker users upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Locker users delete own files" ON storage.objects;

CREATE POLICY "Locker users read own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'compass-artifacts'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'locker'
    AND public.is_user_active(auth.uid())
  );

CREATE POLICY "Locker users upload own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'compass-artifacts'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'locker'
    AND public.is_user_active(auth.uid())
  );

CREATE POLICY "Locker users delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'compass-artifacts'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'locker'
    AND public.is_user_active(auth.uid())
  );
