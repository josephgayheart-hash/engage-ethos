
-- Create library_collections table
CREATE TABLE public.library_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  created_by uuid NOT NULL,
  name text NOT NULL,
  description text,
  collection_type text NOT NULL DEFAULT 'campaign',
  cover_image_url text,
  tags text[] DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create library_collection_items table
CREATE TABLE public.library_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.library_collections(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  item_type text NOT NULL,
  template_id uuid REFERENCES public.shared_templates(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.personal_messages(id) ON DELETE CASCADE,
  external_asset jsonb,
  sort_order integer DEFAULT 0,
  added_by uuid,
  added_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.library_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_collection_items ENABLE ROW LEVEL SECURITY;

-- RLS for library_collections
CREATE POLICY "Users can view collections in their tenant"
  ON public.library_collections FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create collections in their tenant"
  ON public.library_collections FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update collections in their tenant"
  ON public.library_collections FOR UPDATE
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can delete collections in their tenant"
  ON public.library_collections FOR DELETE
  USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can view all collections"
  ON public.library_collections FOR SELECT
  USING (is_super_admin(auth.uid()));

-- RLS for library_collection_items
CREATE POLICY "Users can view collection items in their tenant"
  ON public.library_collection_items FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can add items to collections in their tenant"
  ON public.library_collection_items FOR INSERT
  WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update collection items in their tenant"
  ON public.library_collection_items FOR UPDATE
  USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can remove items from collections in their tenant"
  ON public.library_collection_items FOR DELETE
  USING (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can view all collection items"
  ON public.library_collection_items FOR SELECT
  USING (is_super_admin(auth.uid()));

-- Add external_assets to shared_templates
ALTER TABLE public.shared_templates
  ADD COLUMN external_assets jsonb DEFAULT '[]'::jsonb;

-- Add external_assets to personal_messages
ALTER TABLE public.personal_messages
  ADD COLUMN external_assets jsonb DEFAULT '[]'::jsonb;

-- Triggers for updated_at
CREATE TRIGGER update_library_collections_updated_at
  BEFORE UPDATE ON public.library_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster collection lookups
CREATE INDEX idx_library_collection_items_collection_id ON public.library_collection_items(collection_id);
CREATE INDEX idx_library_collections_tenant_id ON public.library_collections(tenant_id);
