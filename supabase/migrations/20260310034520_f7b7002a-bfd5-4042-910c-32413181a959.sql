
-- Allow super admins to insert content DNA samples for any tenant
CREATE POLICY "Super admins can insert content DNA samples"
ON public.content_dna_samples
FOR INSERT
TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

-- Allow super admins to update content DNA samples for any tenant
CREATE POLICY "Super admins can update content DNA samples"
ON public.content_dna_samples
FOR UPDATE
TO authenticated
USING (is_super_admin(auth.uid()));

-- Allow super admins to delete content DNA samples for any tenant
CREATE POLICY "Super admins can delete content DNA samples"
ON public.content_dna_samples
FOR DELETE
TO authenticated
USING (is_super_admin(auth.uid()));
