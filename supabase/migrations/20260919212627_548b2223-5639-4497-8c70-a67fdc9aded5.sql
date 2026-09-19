CREATE OR REPLACE FUNCTION public.auto_create_prospect_from_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tenant_name text;
  inferred_url text := '';
  email_domain text;
  full_name text;
BEGIN
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT institution_name INTO tenant_name
  FROM public.tenants
  WHERE id = NEW.tenant_id
  LIMIT 1;

  email_domain := split_part(lower(NEW.email), '@', 2);

  IF email_domain IS NOT NULL
    AND email_domain <> ''
    AND email_domain NOT IN ('gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com') THEN
    inferred_url := 'https://' || email_domain;
  END IF;

  full_name := NULLIF(trim(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '')), '');

  IF EXISTS (SELECT 1 FROM public.sales_prospects WHERE lower(contact_email) = lower(NEW.email)) THEN
    UPDATE public.sales_prospects
    SET status = 'qualified',
        contact_name = COALESCE(full_name, contact_name),
        contact_title = COALESCE(NEW.title, contact_title),
        contact_phone = COALESCE(NEW.phone, contact_phone),
        university_name = COALESCE(NULLIF(tenant_name, ''), university_name),
        url = CASE WHEN COALESCE(url, '') = '' THEN inferred_url ELSE url END,
        notes = COALESCE(notes || E'\n', '') || 'Created an account on ' || to_char(now(), 'YYYY-MM-DD'),
        updated_at = now()
    WHERE lower(contact_email) = lower(NEW.email);
  ELSE
    INSERT INTO public.sales_prospects (
      university_name,
      url,
      contact_name,
      contact_email,
      contact_title,
      contact_phone,
      status,
      notes
    ) VALUES (
      COALESCE(tenant_name, 'Unknown'),
      inferred_url,
      full_name,
      NEW.email,
      NEW.title,
      NEW.phone,
      'qualified',
      'Created an account on ' || to_char(now(), 'YYYY-MM-DD')
    );
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.auto_create_prospect_from_profile() FROM anon, authenticated;