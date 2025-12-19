-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.onboarding_requests ENABLE ROW LEVEL SECURITY;

-- Drop any potentially overly permissive policies and recreate with explicit restrictions
-- First, let's ensure no anonymous access is possible by keeping only the needed policies

-- The current policies are:
-- 1. "Public can submit onboarding request" - INSERT (needed for public form)
-- 2. "Authenticated users can submit onboarding request" - INSERT (needed for authenticated users)
-- 3. "Super admins can view onboarding requests" - SELECT (correct)
-- 4. "Super admins can update onboarding requests" - UPDATE (correct)
-- 5. "Super admins can delete onboarding requests" - DELETE (correct)

-- The issue is that with RLS enabled, if there's no matching SELECT policy, 
-- access should be denied. But to be explicit and follow security best practices,
-- we can add a policy that explicitly denies non-super-admin access.

-- However, in PostgreSQL RLS, you can't create "DENY" policies - 
-- access is denied by default if no policy matches.
-- The current setup IS secure because:
-- 1. RLS is enabled
-- 2. The only SELECT policy requires is_super_admin(auth.uid())
-- 3. Anonymous users have auth.uid() = NULL, so is_super_admin returns false

-- To make this more robust, let's verify by recreating the SELECT policy
-- to be absolutely explicit that ONLY super_admins can read

-- Drop and recreate the SELECT policy to ensure it's correctly configured
DROP POLICY IF EXISTS "Super admins can view onboarding requests" ON public.onboarding_requests;

CREATE POLICY "Super admins can view onboarding requests"
ON public.onboarding_requests
FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- This policy explicitly:
-- 1. Only applies to authenticated users (TO authenticated)
-- 2. Requires super_admin role check
-- Anonymous users (anon role) have no SELECT policy, so they are denied