-- Drop existing policies on onboarding_requests
DROP POLICY IF EXISTS "Anyone can submit onboarding request" ON public.onboarding_requests;
DROP POLICY IF EXISTS "Super admins can update onboarding requests" ON public.onboarding_requests;
DROP POLICY IF EXISTS "Super admins can view all onboarding requests" ON public.onboarding_requests;

-- Recreate with explicit role restrictions
-- INSERT: Allow public submissions (required for request access flow) but only to anon role
CREATE POLICY "Public can submit onboarding request" 
ON public.onboarding_requests 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Also allow authenticated users to submit (in case they want to request access to a different tenant)
CREATE POLICY "Authenticated users can submit onboarding request" 
ON public.onboarding_requests 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- SELECT: Only authenticated super admins can view
CREATE POLICY "Super admins can view onboarding requests" 
ON public.onboarding_requests 
FOR SELECT 
TO authenticated
USING (is_super_admin(auth.uid()));

-- UPDATE: Only authenticated super admins can update
CREATE POLICY "Super admins can update onboarding requests" 
ON public.onboarding_requests 
FOR UPDATE 
TO authenticated
USING (is_super_admin(auth.uid()));

-- DELETE: Only authenticated super admins can delete (adding this for completeness)
CREATE POLICY "Super admins can delete onboarding requests" 
ON public.onboarding_requests 
FOR DELETE 
TO authenticated
USING (is_super_admin(auth.uid()));