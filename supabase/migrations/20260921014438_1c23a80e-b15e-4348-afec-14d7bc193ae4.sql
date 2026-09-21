DROP TRIGGER IF EXISTS trg_auto_create_prospect_from_request ON public.onboarding_requests;
DROP FUNCTION IF EXISTS public.auto_create_prospect_from_request();
DROP TABLE IF EXISTS public.onboarding_requests CASCADE;

CREATE OR REPLACE FUNCTION public.capture_site_lead(
  p_email text,
  p_name text DEFAULT NULL,
  p_institution text DEFAULT NULL,
  p_source text DEFAULT 'website',
  p_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  email_domain text;
  inferred_url text := '';
  entry text;
BEGIN
  IF p_email IS NULL OR position('@' in p_email) = 0 THEN
    RAISE EXCEPTION 'A valid email is required';
  END IF;

  email_domain := split_part(lower(p_email), '@', 2);
  IF email_domain <> '' AND email_domain NOT IN ('gmail.com','googlemail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','me.com','mac.com','aol.com','proton.me','protonmail.com') THEN
    inferred_url := 'https://' || email_domain;
  END IF;

  entry := 'Form fill on ' || to_char(now(),'YYYY-MM-DD') || ' via ' || COALESCE(NULLIF(p_source,''), 'website')
           || COALESCE(E'\nMessage: ' || NULLIF(p_message,''), '');

  IF EXISTS (SELECT 1 FROM public.sales_prospects WHERE lower(contact_email) = lower(p_email)) THEN
    UPDATE public.sales_prospects
    SET contact_name = COALESCE(NULLIF(p_name,''), contact_name),
        university_name = COALESCE(NULLIF(p_institution,''), university_name),
        url = CASE WHEN COALESCE(url,'') = '' THEN inferred_url ELSE url END,
        notes = COALESCE(notes || E'\n', '') || entry,
        updated_at = now()
    WHERE lower(contact_email) = lower(p_email);
  ELSE
    INSERT INTO public.sales_prospects (university_name, url, contact_name, contact_email, status, notes)
    VALUES (COALESCE(NULLIF(p_institution,''), 'Unknown'), inferred_url, NULLIF(p_name,''), p_email, 'inbound', entry);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.capture_site_lead(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.capture_site_lead(text, text, text, text, text) TO anon, authenticated;