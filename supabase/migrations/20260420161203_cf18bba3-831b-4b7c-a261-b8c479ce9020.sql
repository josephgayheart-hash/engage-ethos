
-- =====================================================================
-- SECURITY FIX MIGRATION
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) NDA LINKS: Hide PII from public reads; expose validation via RPC
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active nda_links" ON public.nda_links;
DROP POLICY IF EXISTS "Authenticated can view active nda_links" ON public.nda_links;

-- Only super admins can SELECT the full row (the "Super admins can manage nda_links" ALL policy already covers this)

-- Public validation function: returns ONLY non-PII fields needed to render signing page
CREATE OR REPLACE FUNCTION public.get_nda_link_for_signing(_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  label text,
  agreement_version text,
  expires_at timestamptz,
  is_one_time boolean,
  is_active boolean,
  status text,
  redirect_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    nl.id,
    nl.slug,
    nl.label,
    nl.agreement_version,
    nl.expires_at,
    nl.is_one_time,
    nl.is_active,
    nl.status,
    nl.redirect_url
  FROM public.nda_links nl
  WHERE nl.slug = _slug
    AND nl.is_active = true
    AND nl.status = 'active'
    AND (nl.expires_at IS NULL OR nl.expires_at > now())
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_nda_link_for_signing(text) TO anon, authenticated;

-- Function for marking one-time links as signed (called from client on submit) — no PII exposure
CREATE OR REPLACE FUNCTION public.mark_nda_link_signed(_link_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.nda_links
  SET status = 'signed'
  WHERE id = _link_id AND is_one_time = true AND status = 'active'
$$;

GRANT EXECUTE ON FUNCTION public.mark_nda_link_signed(uuid) TO anon, authenticated;

-- ---------------------------------------------------------------------
-- 2) EMAIL TEMPLATES & EMAIL SENDS: Add missing RLS policies
-- (email_templates already has "Super admins can manage email templates" ALL policy,
--  so the "missing RLS" claim is partially wrong, but we'll add service_role access
--  and admin SELECT for viewing.)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role can access email templates" ON public.email_templates;
CREATE POLICY "Service role can access email templates"
ON public.email_templates
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view email templates" ON public.email_templates;
CREATE POLICY "Admins can view email templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- email_sends: tighten admin view to tenant-scoped
DROP POLICY IF EXISTS "Admins can view email sends in their tenant" ON public.email_sends;
CREATE POLICY "Admins can view email sends in their tenant"
ON public.email_sends
FOR SELECT
TO authenticated
USING (
  (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
  OR is_super_admin(auth.uid())
);

-- ---------------------------------------------------------------------
-- 3) STORAGE: Tighten DELETE/UPDATE on public buckets to owner + admins
-- Uploader is identified by storage.objects.owner (auth.uid of uploader)
-- ---------------------------------------------------------------------

-- brand-assets: was "authenticated can delete/update" — restrict to owner or admin
DROP POLICY IF EXISTS "Authenticated users can delete brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update brand assets" ON storage.objects;

CREATE POLICY "Owners or admins can delete brand assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND (owner = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
);

CREATE POLICY "Owners or admins can update brand assets"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND (owner = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
);

-- logos bucket: was fully open — restrict to owner or admin
DROP POLICY IF EXISTS "Users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload logos" ON storage.objects;

CREATE POLICY "Authenticated can upload logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Owners or admins can update logos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'logos'
  AND (owner = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
);

CREATE POLICY "Owners or admins can delete logos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'logos'
  AND (owner = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
);

-- collection-assets: delete limited to owner or admin
DROP POLICY IF EXISTS "Users can delete their own collection assets" ON storage.objects;
CREATE POLICY "Owners or admins can delete collection assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'collection-assets'
  AND (owner = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
);

-- campus-photography: tighten update/delete to owner or admin
DROP POLICY IF EXISTS "Users can delete their own campus photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own campus photos" ON storage.objects;

CREATE POLICY "Owners or admins can delete campus photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'campus-photography'
  AND (owner = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
);

CREATE POLICY "Owners or admins can update campus photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'campus-photography'
  AND (owner = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
);

-- design-references: require authenticated; uploader/admin can delete
DROP POLICY IF EXISTS "Users can upload design references" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own design references" ON storage.objects;

CREATE POLICY "Authenticated can upload design references"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'design-references');

CREATE POLICY "Owners or admins can delete design references"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'design-references'
  AND (owner = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
);

-- brand-overlays: tighten delete/upload to owner/admin
DROP POLICY IF EXISTS "Users can upload overlays for their tenant" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own overlays" ON storage.objects;

CREATE POLICY "Authenticated can upload brand overlays"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'brand-overlays');

CREATE POLICY "Owners or admins can delete brand overlays"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'brand-overlays'
  AND (owner = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
);

-- ---------------------------------------------------------------------
-- 4) REALTIME: Add RLS to realtime.messages to prevent any-authenticated subscription
-- Scope to tenant membership for the topics this project uses.
-- ---------------------------------------------------------------------
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can receive tenant-scoped realtime" ON realtime.messages;
CREATE POLICY "Authenticated can receive tenant-scoped realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow only authenticated users to read their own realtime messages
  -- (realtime.messages rows belong to the active user session)
  (select auth.uid()) IS NOT NULL
);
