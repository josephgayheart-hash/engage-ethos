-- Create two test tenants
INSERT INTO public.tenants (id, institution_name, status, primary_color, accent_color)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'University A', 'active', '#1F2A44', '#2C7A7B'),
  ('22222222-2222-2222-2222-222222222222', 'University B', 'active', '#1F2A44', '#2C7A7B');

-- Create institutional config for both tenants
INSERT INTO public.institutional_config (tenant_id, config)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '{}'),
  ('22222222-2222-2222-2222-222222222222', '{}');