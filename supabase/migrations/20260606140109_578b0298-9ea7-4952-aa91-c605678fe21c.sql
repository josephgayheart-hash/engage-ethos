-- 1. Restrict tenant_integrations SELECT to admins (credentials in JSONB).
DROP POLICY IF EXISTS "Users can view integrations in their tenant" ON public.tenant_integrations;

CREATE POLICY "Admins can view integrations in their tenant"
ON public.tenant_integrations
FOR SELECT
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Prevent tenant admins from escalating to super_admin via user_roles.
DROP POLICY IF EXISTS "Admins can manage roles in their tenant" ON public.user_roles;

CREATE POLICY "Admins can view roles in their tenant"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can insert non-super-admin roles in their tenant"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
);

CREATE POLICY "Admins can update non-super-admin roles in their tenant"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
)
WITH CHECK (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
);

CREATE POLICY "Admins can delete non-super-admin roles in their tenant"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
);

-- 3. Allow tenant admins to view nda_links they created (manage in their tenant).
CREATE POLICY "Admins can view nda_links in their tenant"
ON public.nda_links
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Tighten realtime.messages subscription policy: require exact-segment match
--    on topics of the form "<scope>:<uuid>[:...]" instead of LIKE substring.
DROP POLICY IF EXISTS "Users can subscribe to their own scoped topics" ON realtime.messages;

CREATE POLICY "Users can subscribe to their own scoped topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) IS NOT NULL
  AND (
    public.is_super_admin((SELECT auth.uid()))
    OR (SELECT auth.uid())::text = ANY (string_to_array(realtime.topic(), ':'))
    OR public.get_user_tenant_id((SELECT auth.uid()))::text = ANY (string_to_array(realtime.topic(), ':'))
  )
);
