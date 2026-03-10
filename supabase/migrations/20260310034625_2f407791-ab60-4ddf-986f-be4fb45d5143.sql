
-- content_dna_adjustments: super admin needs INSERT/UPDATE/DELETE
CREATE POLICY "Super admins can insert adjustments"
ON public.content_dna_adjustments FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update adjustments"
ON public.content_dna_adjustments FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete adjustments"
ON public.content_dna_adjustments FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- fact_book: super admin needs INSERT/UPDATE/DELETE
CREATE POLICY "Super admins can insert facts"
ON public.fact_book FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update facts"
ON public.fact_book FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete facts"
ON public.fact_book FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- campus_photo_samples: super admin needs INSERT/UPDATE/DELETE
CREATE POLICY "Super admins can insert campus photos"
ON public.campus_photo_samples FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update campus photos"
ON public.campus_photo_samples FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete campus photos"
ON public.campus_photo_samples FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- design_references: super admin needs INSERT/UPDATE/DELETE
CREATE POLICY "Super admins can insert design references"
ON public.design_references FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update design references"
ON public.design_references FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete design references"
ON public.design_references FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- custom_overlay_patterns: super admin needs INSERT/UPDATE/DELETE
CREATE POLICY "Super admins can insert overlays"
ON public.custom_overlay_patterns FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update overlays"
ON public.custom_overlay_patterns FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete overlays"
ON public.custom_overlay_patterns FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- brand_audit_touchpoints: super admin needs all
CREATE POLICY "Super admins can view all touchpoints"
ON public.brand_audit_touchpoints FOR SELECT TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert touchpoints"
ON public.brand_audit_touchpoints FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update touchpoints"
ON public.brand_audit_touchpoints FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete touchpoints"
ON public.brand_audit_touchpoints FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- brand_audit_reports: super admin needs INSERT/SELECT
CREATE POLICY "Super admins can view all audit reports"
ON public.brand_audit_reports FOR SELECT TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert audit reports"
ON public.brand_audit_reports FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

-- institutional_config: super admin needs UPDATE/DELETE
CREATE POLICY "Super admins can update institutional config"
ON public.institutional_config FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can view all institutional config"
ON public.institutional_config FOR SELECT TO authenticated
USING (is_super_admin(auth.uid()));

-- library_collections: super admin needs INSERT/UPDATE/DELETE
CREATE POLICY "Super admins can insert collections"
ON public.library_collections FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update collections"
ON public.library_collections FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete collections"
ON public.library_collections FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- library_collection_items: super admin needs INSERT/UPDATE/DELETE
CREATE POLICY "Super admins can insert collection items"
ON public.library_collection_items FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update collection items"
ON public.library_collection_items FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete collection items"
ON public.library_collection_items FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- institutional_profiles: super admin needs DELETE
CREATE POLICY "Super admins can delete profiles"
ON public.institutional_profiles FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- byoc_uploads: super admin needs INSERT/UPDATE/DELETE
CREATE POLICY "Super admins can insert BYOC uploads"
ON public.byoc_uploads FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update BYOC uploads"
ON public.byoc_uploads FOR UPDATE TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete BYOC uploads"
ON public.byoc_uploads FOR DELETE TO authenticated
USING (is_super_admin(auth.uid()));

-- content_dna_versions: super admin needs INSERT (for trigger-based inserts)
CREATE POLICY "Super admins can insert versions"
ON public.content_dna_versions FOR INSERT TO authenticated
WITH CHECK (is_super_admin(auth.uid()));
