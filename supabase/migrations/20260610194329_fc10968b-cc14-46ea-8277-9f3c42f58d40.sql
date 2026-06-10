DROP POLICY IF EXISTS "Locker shared recipients read files" ON storage.objects;

CREATE POLICY "Locker shared recipients read files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'compass-artifacts'
    AND public.is_user_active(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.compass_locker_items li
      WHERE auth.uid() = ANY (li.shared_with_user_ids)
        AND (
          li.storage_path = storage.objects.name
          OR storage.objects.name LIKE li.storage_path || '.part-%'
        )
    )
  );