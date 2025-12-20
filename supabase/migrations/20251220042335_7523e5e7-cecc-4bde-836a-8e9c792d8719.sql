-- Tighten access for email_nudges (contains PII)
ALTER TABLE public.email_nudges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage all nudges" ON public.email_nudges;
DROP POLICY IF EXISTS "Super admins can view all nudges" ON public.email_nudges;
DROP POLICY IF EXISTS "Users can view their own nudges" ON public.email_nudges;
DROP POLICY IF EXISTS "Super admins can insert nudges" ON public.email_nudges;
DROP POLICY IF EXISTS "Super admins can update nudges" ON public.email_nudges;
DROP POLICY IF EXISTS "Super admins can delete nudges" ON public.email_nudges;

CREATE POLICY "Service role can manage all nudges"
ON public.email_nudges
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Super admins can view all nudges"
ON public.email_nudges
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own nudges"
ON public.email_nudges
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admins can insert nudges"
ON public.email_nudges
FOR INSERT
TO authenticated
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update nudges"
ON public.email_nudges
FOR UPDATE
TO authenticated
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete nudges"
ON public.email_nudges
FOR DELETE
TO authenticated
USING (is_super_admin(auth.uid()));


-- Tighten access for email_sends (contains metadata + user linkage)
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage email sends" ON public.email_sends;
DROP POLICY IF EXISTS "Super admins can view email sends" ON public.email_sends;

CREATE POLICY "Service role can manage email sends"
ON public.email_sends
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Super admins can view email sends"
ON public.email_sends
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));