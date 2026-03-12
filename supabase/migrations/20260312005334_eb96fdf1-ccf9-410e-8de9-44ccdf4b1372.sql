-- Add missing super admin CRUD policies for story_bank
CREATE POLICY "Super admins can insert stories"
  ON public.story_bank FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update stories"
  ON public.story_bank FOR UPDATE
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete stories"
  ON public.story_bank FOR DELETE
  TO authenticated
  USING (is_super_admin(auth.uid()));