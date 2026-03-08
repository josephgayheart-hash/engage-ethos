
-- Create nda_links table
CREATE TABLE public.nda_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  recipient_name text,
  recipient_email text,
  organization text,
  redirect_url text,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  is_one_time boolean NOT NULL DEFAULT true,
  agreement_version text NOT NULL DEFAULT '1.0',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active'
);

-- Create nda_responses table
CREATE TABLE public.nda_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nda_link_id uuid REFERENCES public.nda_links(id) ON DELETE CASCADE NOT NULL,
  signer_name text NOT NULL,
  signer_email text NOT NULL,
  signer_organization text,
  signer_title text,
  typed_signature text NOT NULL,
  drawn_signature_url text,
  agreement_text text NOT NULL,
  agreement_version text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  timezone text,
  redirect_url text,
  public_slug text,
  status text NOT NULL DEFAULT 'signed'
);

-- Enable RLS
ALTER TABLE public.nda_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_responses ENABLE ROW LEVEL SECURITY;

-- RLS for nda_links: super admins full CRUD
CREATE POLICY "Super admins can manage nda_links"
  ON public.nda_links FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- RLS for nda_links: anonymous/public can SELECT active links by slug
CREATE POLICY "Public can view active nda_links"
  ON public.nda_links FOR SELECT
  TO anon
  USING (is_active = true AND status = 'active');

-- Also allow authenticated users to view active links (for signed-in visitors)
CREATE POLICY "Authenticated can view active nda_links"
  ON public.nda_links FOR SELECT
  TO authenticated
  USING (is_active = true AND status = 'active');

-- RLS for nda_responses: super admins full access
CREATE POLICY "Super admins can manage nda_responses"
  ON public.nda_responses FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- RLS for nda_responses: anonymous can INSERT (public signing)
CREATE POLICY "Public can submit nda_responses"
  ON public.nda_responses FOR INSERT
  TO anon
  WITH CHECK (
    signer_name IS NOT NULL AND length(signer_name) <= 200
    AND signer_email IS NOT NULL AND length(signer_email) <= 255
    AND typed_signature IS NOT NULL AND length(typed_signature) <= 200
    AND agreement_text IS NOT NULL
  );

-- Also allow authenticated to INSERT responses
CREATE POLICY "Authenticated can submit nda_responses"
  ON public.nda_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    signer_name IS NOT NULL AND length(signer_name) <= 200
    AND signer_email IS NOT NULL AND length(signer_email) <= 255
    AND typed_signature IS NOT NULL AND length(typed_signature) <= 200
    AND agreement_text IS NOT NULL
  );

-- Create nda-signatures storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('nda-signatures', 'nda-signatures', true);

-- Storage RLS: anyone can upload to nda-signatures
CREATE POLICY "Anyone can upload nda signatures"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'nda-signatures');

-- Storage RLS: anyone can read nda signatures
CREATE POLICY "Anyone can read nda signatures"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'nda-signatures');
