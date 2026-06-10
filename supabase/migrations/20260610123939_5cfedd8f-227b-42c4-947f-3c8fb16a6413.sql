DROP POLICY IF EXISTS "Active users read all locker items" ON public.compass_locker_items;

CREATE POLICY "Users read own locker items" ON public.compass_locker_items
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.is_user_active(auth.uid()));

DROP POLICY IF EXISTS "Active users read locker files" ON storage.objects;

CREATE POLICY "Locker users read own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'compass-artifacts'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] = 'locker'
    AND public.is_user_active(auth.uid())
  );