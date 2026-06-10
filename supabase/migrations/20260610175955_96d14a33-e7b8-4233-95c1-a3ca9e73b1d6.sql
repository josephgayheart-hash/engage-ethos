
ALTER TABLE public.compass_locker_items
  ADD COLUMN IF NOT EXISTS shared_with_user_ids uuid[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS compass_locker_items_shared_with_idx
  ON public.compass_locker_items USING GIN (shared_with_user_ids);

-- Replace SELECT policy to include shared recipients
DROP POLICY IF EXISTS "Users read own locker items" ON public.compass_locker_items;
CREATE POLICY "Users read own or shared locker items"
  ON public.compass_locker_items
  FOR SELECT
  USING (
    is_user_active(auth.uid())
    AND (
      user_id = auth.uid()
      OR auth.uid() = ANY (shared_with_user_ids)
    )
  );

-- Storage: let shared recipients read the underlying file
CREATE POLICY "Locker shared recipients read files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'compass-artifacts'
    AND is_user_active(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.compass_locker_items li
      WHERE li.storage_path = storage.objects.name
        AND auth.uid() = ANY (li.shared_with_user_ids)
    )
  );
