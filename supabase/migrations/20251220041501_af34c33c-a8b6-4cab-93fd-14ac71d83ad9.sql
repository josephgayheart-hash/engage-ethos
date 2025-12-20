-- Add policy for super admins to insert email nudges
CREATE POLICY "Super admins can insert nudges" 
ON public.email_nudges 
FOR INSERT 
TO authenticated 
WITH CHECK (is_super_admin(auth.uid()));

-- Add policy for super admins to update nudges
CREATE POLICY "Super admins can update nudges" 
ON public.email_nudges 
FOR UPDATE 
TO authenticated 
USING (is_super_admin(auth.uid()));

-- Add policy for super admins to delete nudges
CREATE POLICY "Super admins can delete nudges" 
ON public.email_nudges 
FOR DELETE 
TO authenticated 
USING (is_super_admin(auth.uid()));