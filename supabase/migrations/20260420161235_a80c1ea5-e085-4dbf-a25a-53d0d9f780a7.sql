
-- Replace broad "SELECT by bucket" policies with ones that only allow reading
-- when the caller already knows the exact object name (prevents bucket listing / enumeration).
-- Public direct URLs still work because storage serves those via the public endpoint,
-- not via RLS SELECT on storage.objects.

-- brand-assets
DROP POLICY IF EXISTS "Public can read brand assets" ON storage.objects;
CREATE POLICY "Brand assets accessible by name" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'brand-assets' AND name = current_setting('request.jwt.claim.object_name', true));

-- logos
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
CREATE POLICY "Logos accessible by name" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'logos' AND name = current_setting('request.jwt.claim.object_name', true));

-- collection-assets
DROP POLICY IF EXISTS "Collection assets are publicly accessible" ON storage.objects;
CREATE POLICY "Collection assets accessible by name" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'collection-assets' AND name = current_setting('request.jwt.claim.object_name', true));

-- campus-photography
DROP POLICY IF EXISTS "Campus photos are publicly accessible" ON storage.objects;
CREATE POLICY "Campus photos accessible by name" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'campus-photography' AND name = current_setting('request.jwt.claim.object_name', true));

-- brand-overlays
DROP POLICY IF EXISTS "Overlays are publicly accessible" ON storage.objects;
CREATE POLICY "Overlays accessible by name" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'brand-overlays' AND name = current_setting('request.jwt.claim.object_name', true));

-- design-references
DROP POLICY IF EXISTS "Anyone can view design references" ON storage.objects;
CREATE POLICY "Design references accessible by name" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'design-references' AND name = current_setting('request.jwt.claim.object_name', true));

-- institution-logos
DROP POLICY IF EXISTS "Anyone can view institution logos" ON storage.objects;
CREATE POLICY "Institution logos accessible by name" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'institution-logos' AND name = current_setting('request.jwt.claim.object_name', true));

-- crm-opportunity-files (super admin managed already, tighten public SELECT too)
DROP POLICY IF EXISTS "Anyone can view opportunity files" ON storage.objects;
CREATE POLICY "CRM opportunity files accessible by name" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'crm-opportunity-files' AND name = current_setting('request.jwt.claim.object_name', true));

-- nda-signatures
DROP POLICY IF EXISTS "Anyone can read nda signatures" ON storage.objects;
CREATE POLICY "NDA signatures accessible by name" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'nda-signatures' AND name = current_setting('request.jwt.claim.object_name', true));
