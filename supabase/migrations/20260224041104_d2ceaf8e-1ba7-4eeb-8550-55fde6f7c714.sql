-- Backfill existing app users into sales_prospects (skip super admins and already-existing contacts)
INSERT INTO public.sales_prospects (university_name, contact_name, contact_email, contact_title, status, notes, url)
SELECT 
  COALESCE(t.institution_name, 'Unknown'),
  COALESCE(p.first_name || ' ' || p.last_name, p.email),
  p.email,
  p.title,
  'contacted',
  'Backfilled from existing app user on ' || to_char(now(), 'YYYY-MM-DD'),
  ''
FROM public.profiles p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
WHERE p.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.sales_prospects sp WHERE sp.contact_email = p.email
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id AND ur.role = 'super_admin'
  );