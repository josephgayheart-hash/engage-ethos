-- Fix audit_log INSERT policy to ensure actor_user_id matches authenticated user
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;

CREATE POLICY "Users can insert their own audit logs" 
ON public.audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND (actor_user_id IS NULL OR actor_user_id = auth.uid())
);

-- Tighten content_dna_samples to be user-specific (not just tenant)
DROP POLICY IF EXISTS "Users can manage their tenant content DNA samples" ON public.content_dna_samples;

CREATE POLICY "Users can view content DNA in their tenant" 
ON public.content_dna_samples 
FOR SELECT 
TO authenticated
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert their own content DNA samples" 
ON public.content_dna_samples 
FOR INSERT 
TO authenticated
WITH CHECK (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND user_id = auth.uid()
);

CREATE POLICY "Users can update their own content DNA samples" 
ON public.content_dna_samples 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete their own content DNA samples" 
ON public.content_dna_samples 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id(auth.uid()));

-- Tighten byoc_uploads to be user-specific
DROP POLICY IF EXISTS "Users can manage their tenant BYOC uploads" ON public.byoc_uploads;

CREATE POLICY "Users can view BYOC uploads in their tenant" 
ON public.byoc_uploads 
FOR SELECT 
TO authenticated
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert their own BYOC uploads" 
ON public.byoc_uploads 
FOR INSERT 
TO authenticated
WITH CHECK (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND user_id = auth.uid()
);

CREATE POLICY "Users can update their own BYOC uploads" 
ON public.byoc_uploads 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete their own BYOC uploads" 
ON public.byoc_uploads 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid() AND tenant_id = get_user_tenant_id(auth.uid()));