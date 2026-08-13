DROP POLICY IF EXISTS "Users read own or shared locker items" ON public.compass_locker_items;
CREATE POLICY "Users read own or shared locker items"
ON public.compass_locker_items
FOR SELECT
TO authenticated
USING (
  is_user_active(auth.uid())
  AND (expires_at IS NULL OR expires_at > now())
  AND (user_id = auth.uid() OR auth.uid() = ANY (shared_with_user_ids))
);

DROP POLICY IF EXISTS "Locker shared recipients read files" ON storage.objects;
CREATE POLICY "Locker shared recipients read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'compass-artifacts'
  AND is_user_active(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.compass_locker_items li
    WHERE auth.uid() = ANY (li.shared_with_user_ids)
      AND (li.expires_at IS NULL OR li.expires_at > now())
      AND (li.storage_path = objects.name OR objects.name LIKE li.storage_path || '.part-%')
  )
);

CREATE TABLE IF NOT EXISTS public.compass_locker_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid,
  owner_id uuid,
  actor_id uuid,
  action text NOT NULL,
  file_name text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.compass_locker_audit TO authenticated;
GRANT ALL ON public.compass_locker_audit TO service_role;
ALTER TABLE public.compass_locker_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Locker audit readable by owner or platform admin" ON public.compass_locker_audit;
CREATE POLICY "Locker audit readable by owner or platform admin"
ON public.compass_locker_audit
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR actor_id = auth.uid()
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Locker audit insert by actor" ON public.compass_locker_audit;
CREATE POLICY "Locker audit insert by actor"
ON public.compass_locker_audit
FOR INSERT
TO authenticated
WITH CHECK (actor_id = auth.uid());

CREATE INDEX IF NOT EXISTS compass_locker_audit_owner_idx ON public.compass_locker_audit (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS compass_locker_audit_item_idx ON public.compass_locker_audit (item_id);
CREATE INDEX IF NOT EXISTS compass_locker_items_expiry_idx ON public.compass_locker_items (expires_at);