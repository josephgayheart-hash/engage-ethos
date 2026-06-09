
-- Broaden SELECT to all active users; keep insert/update/delete owner-only
DROP POLICY IF EXISTS "Users read own locker items" ON public.compass_locker_items;

CREATE POLICY "Active users read all locker items" ON public.compass_locker_items
  FOR SELECT TO authenticated
  USING (public.is_user_active(auth.uid()));

-- Storage: allow any active user to read locker files
DROP POLICY IF EXISTS "Locker users read own files" ON storage.objects;

CREATE POLICY "Active users read locker files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'compass-artifacts'
    AND (storage.foldername(name))[2] = 'locker'
    AND public.is_user_active(auth.uid())
  );
