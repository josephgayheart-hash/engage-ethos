-- Restrict outreach_history to super admins (CRM is super-admin-only)
DROP POLICY IF EXISTS "Allow authenticated users to manage outreach history" ON public.outreach_history;

CREATE POLICY "Super admins can view outreach history"
ON public.outreach_history
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert outreach history"
ON public.outreach_history
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update outreach history"
ON public.outreach_history
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete outreach history"
ON public.outreach_history
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));