-- Add policy for super admins to INSERT content DNA analysis
CREATE POLICY "Super admins can insert DNA analysis"
ON public.content_dna_analysis
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Add policy for super admins to UPDATE content DNA analysis
CREATE POLICY "Super admins can update DNA analysis"
ON public.content_dna_analysis
FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Add policy for super admins to DELETE content DNA analysis  
CREATE POLICY "Super admins can delete DNA analysis"
ON public.content_dna_analysis
FOR DELETE
USING (is_super_admin(auth.uid()));