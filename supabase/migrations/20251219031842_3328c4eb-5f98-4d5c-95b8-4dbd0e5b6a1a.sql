-- Add policy allowing admins to delete any content DNA samples in their tenant
CREATE POLICY "Admins can delete any content DNA samples in their tenant"
ON public.content_dna_samples
FOR DELETE
TO authenticated
USING (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::app_role)
);