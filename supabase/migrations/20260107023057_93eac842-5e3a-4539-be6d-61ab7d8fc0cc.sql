-- Phase 1 Security Enhancements

-- 1. Create rate limiting table for edge functions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user_id
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits (identifier, endpoint, window_start);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limits (edge functions use service role)
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Create security audit table for tracking suspicious activity
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- 'rate_limit_exceeded', 'invalid_login', 'suspicious_access', etc.
  identifier text, -- IP address or user_id
  endpoint text,
  metadata jsonb DEFAULT '{}'::jsonb,
  severity text NOT NULL DEFAULT 'info', -- 'info', 'warn', 'error', 'critical'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for querying security events
CREATE INDEX idx_security_events_type ON public.security_events (event_type, created_at);
CREATE INDEX idx_security_events_severity ON public.security_events (severity, created_at);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only service role can insert security events
CREATE POLICY "Service role can manage security events" ON public.security_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Super admins can view security events
CREATE POLICY "Super admins can view security events" ON public.security_events
  FOR SELECT
  USING (is_super_admin(auth.uid()));

-- 3. Create rate limiting function for edge functions
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_endpoint text,
  p_max_requests integer DEFAULT 60,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamp with time zone;
  v_current_count integer;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;
  
  -- Get current request count in window
  SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start > v_window_start;
  
  -- Check if limit exceeded
  IF v_current_count >= p_max_requests THEN
    -- Log security event
    INSERT INTO public.security_events (event_type, identifier, endpoint, severity, metadata)
    VALUES ('rate_limit_exceeded', p_identifier, p_endpoint, 'warn', 
            jsonb_build_object('count', v_current_count, 'limit', p_max_requests));
    RETURN false;
  END IF;
  
  -- Insert new request record
  INSERT INTO public.rate_limits (identifier, endpoint, window_start)
  VALUES (p_identifier, p_endpoint, now());
  
  -- Cleanup old records (keep last hour only)
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - interval '1 hour';
  
  RETURN true;
END;
$$;

-- 4. Tighten onboarding_requests to restrict what fields can be submitted
-- Remove the duplicate public policy (keep only authenticated)
DROP POLICY IF EXISTS "Public can submit onboarding request" ON public.onboarding_requests;

-- Update the authenticated policy to be more restrictive
DROP POLICY IF EXISTS "Authenticated users can submit onboarding request" ON public.onboarding_requests;
CREATE POLICY "Authenticated users can submit onboarding request" ON public.onboarding_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Ensure required fields are present and reasonable
    first_name IS NOT NULL AND length(first_name) <= 100
    AND last_name IS NOT NULL AND length(last_name) <= 100
    AND email IS NOT NULL AND length(email) <= 255
    AND (phone IS NULL OR length(phone) <= 50)
    AND (department IS NULL OR length(department) <= 200)
    AND (title IS NULL OR length(title) <= 200)
    AND (institution_name_input IS NULL OR length(institution_name_input) <= 300)
    AND (notes IS NULL OR length(notes) <= 2000)
    AND request_status = 'submitted'
  );

-- Also allow anonymous submissions with validation
CREATE POLICY "Anonymous users can submit onboarding request" ON public.onboarding_requests
  FOR INSERT
  TO anon
  WITH CHECK (
    first_name IS NOT NULL AND length(first_name) <= 100
    AND last_name IS NOT NULL AND length(last_name) <= 100
    AND email IS NOT NULL AND length(email) <= 255
    AND (phone IS NULL OR length(phone) <= 50)
    AND (department IS NULL OR length(department) <= 200)
    AND (title IS NULL OR length(title) <= 200)
    AND (institution_name_input IS NULL OR length(institution_name_input) <= 300)
    AND (notes IS NULL OR length(notes) <= 2000)
    AND request_status = 'submitted'
  );

-- 5. Restrict audit_log viewing to admins only (not all users)
DROP POLICY IF EXISTS "Users can view audit logs in their tenant" ON public.audit_log;
CREATE POLICY "Admins can view audit logs in their tenant" ON public.audit_log
  FOR SELECT
  USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
    OR is_super_admin(auth.uid())
  );

-- 6. Restrict tool_usage_events viewing to own events or admins
DROP POLICY IF EXISTS "Users can view own tenant usage or super admins can view all" ON public.tool_usage_events;
CREATE POLICY "Users can view their own usage" ON public.tool_usage_events
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view tenant usage" ON public.tool_usage_events
  FOR SELECT
  USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
    OR is_super_admin(auth.uid())
  );