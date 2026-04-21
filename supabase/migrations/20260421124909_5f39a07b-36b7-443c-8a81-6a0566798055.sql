-- ============================================================
-- 1) NDA SIGNATURES BUCKET: Make private + scope policies
-- ============================================================

-- Convert nda-signatures bucket to private
UPDATE storage.buckets SET public = false WHERE id = 'nda-signatures';

-- Drop overly permissive existing policies
DROP POLICY IF EXISTS "Anyone can upload nda signatures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read nda signatures" ON storage.objects;
DROP POLICY IF EXISTS "NDA signatures accessible by name" ON storage.objects;

-- Allow anonymous + authenticated uploads but require .png file in root with constrained name pattern
-- Filename pattern enforced: <slug>-<timestamp>.png (no path traversal, single segment)
CREATE POLICY "Public can upload NDA signatures with valid name"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'nda-signatures'
  AND position('/' in name) = 0
  AND name ~ '^[a-zA-Z0-9_-]+-[0-9]+\.png$'
  AND octet_length(name) < 200
);

-- Only super admins can read NDA signature files directly
CREATE POLICY "Super admins can read NDA signatures"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'nda-signatures'
  AND public.is_super_admin(auth.uid())
);

-- Only super admins can delete NDA signature files
CREATE POLICY "Super admins can delete NDA signatures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'nda-signatures'
  AND public.is_super_admin(auth.uid())
);

-- ============================================================
-- 2) REALTIME: Scope channel topics to user/tenant
-- ============================================================
-- Existing policy let any authenticated user subscribe to ANY topic.
-- Our app uses topics like:
--   playground-sync-<user_id>   (per-user playground sync)
--   email-nudges-realtime       (super admin only)
-- Lock down so users can only subscribe to topics that include their user_id,
-- and super admins can subscribe to anything.

DROP POLICY IF EXISTS "Authenticated can receive tenant-scoped realtime" ON realtime.messages;

CREATE POLICY "Users can subscribe to their own scoped topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (select auth.uid()) IS NOT NULL
  AND (
    -- Super admins can subscribe to any channel (e.g. admin dashboards)
    public.is_super_admin((select auth.uid()))
    -- Or the topic must include this user's id (e.g. playground-sync-<uid>)
    OR realtime.topic() LIKE '%' || (select auth.uid())::text || '%'
    -- Or the topic must include this user's tenant id
    OR realtime.topic() LIKE '%' || public.get_user_tenant_id((select auth.uid()))::text || '%'
  )
);