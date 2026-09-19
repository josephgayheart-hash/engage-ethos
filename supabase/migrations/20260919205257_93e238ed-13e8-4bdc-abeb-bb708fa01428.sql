CREATE OR REPLACE FUNCTION public.auto_create_prospect_from_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  email_domain text;
  inferred_url text := '';
  full_name text;
BEGIN
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  email_domain := split_part(lower(NEW.email), '@', 2);

  IF email_domain IS NOT NULL
    AND email_domain <> ''
    AND email_domain NOT IN ('gmail.com','googlemail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','me.com','mac.com','aol.com','proton.me','protonmail.com') THEN
    inferred_url := 'https://' || email_domain;
  END IF;

  full_name := NULLIF(trim(COALESCE(NEW.first_name,'') || ' ' || COALESCE(NEW.last_name,'')), '');

  IF EXISTS (SELECT 1 FROM public.sales_prospects WHERE lower(contact_email) = lower(NEW.email)) THEN
    UPDATE public.sales_prospects
    SET contact_name = COALESCE(full_name, contact_name),
        contact_title = COALESCE(NEW.title, contact_title),
        contact_phone = COALESCE(NEW.phone, contact_phone),
        university_name = COALESCE(NULLIF(NEW.institution_name_input,''), NULLIF(NEW.agency_name,''), university_name),
        url = CASE WHEN COALESCE(url,'') = '' THEN inferred_url ELSE url END,
        notes = COALESCE(notes || E'\n', '') || 'New inbound request on ' || to_char(now(),'YYYY-MM-DD')
                || COALESCE(' via ' || NEW.referral_source, '')
                || COALESCE(E'\nMessage: ' || NEW.notes, ''),
        updated_at = now()
    WHERE lower(contact_email) = lower(NEW.email);
  ELSE
    INSERT INTO public.sales_prospects (
      university_name, url, contact_name, contact_email, contact_title, contact_phone, status, notes
    ) VALUES (
      COALESCE(NULLIF(NEW.institution_name_input,''), NULLIF(NEW.agency_name,''), 'Unknown'),
      inferred_url,
      full_name,
      NEW.email,
      NEW.title,
      NEW.phone,
      'inbound',
      'Inbound request submitted ' || to_char(now(),'YYYY-MM-DD')
        || COALESCE(' via ' || NEW.referral_source, '')
        || COALESCE(E'\nMessage: ' || NEW.notes, '')
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_prospect_from_request ON public.onboarding_requests;
CREATE TRIGGER trg_auto_create_prospect_from_request
AFTER INSERT ON public.onboarding_requests
FOR EACH ROW EXECUTE FUNCTION public.auto_create_prospect_from_request();