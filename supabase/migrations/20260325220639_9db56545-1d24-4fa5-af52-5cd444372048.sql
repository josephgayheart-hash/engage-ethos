CREATE OR REPLACE FUNCTION public.auto_create_prospect_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tenant_name text;
  inferred_url text := '';
  email_domain text;
BEGIN
  SELECT institution_name INTO tenant_name
  FROM public.tenants
  WHERE id = NEW.tenant_id
  LIMIT 1;

  IF NEW.email IS NOT NULL THEN
    email_domain := split_part(lower(NEW.email), '@', 2);

    IF email_domain IS NOT NULL
      AND email_domain <> ''
      AND email_domain NOT IN ('gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com') THEN
      inferred_url := 'https://' || email_domain;
    END IF;
  END IF;

  IF NEW.email IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.sales_prospects WHERE contact_email = NEW.email
  ) THEN
    INSERT INTO public.sales_prospects (
      university_name,
      url,
      contact_name,
      contact_email,
      contact_title,
      status,
      notes
    ) VALUES (
      COALESCE(tenant_name, 'Unknown'),
      inferred_url,
      NULLIF(trim(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '')), ''),
      NEW.email,
      NEW.title,
      'contacted',
      'Auto-created from app signup on ' || to_char(now(), 'YYYY-MM-DD')
    );
  END IF;

  RETURN NEW;
END;
$$;