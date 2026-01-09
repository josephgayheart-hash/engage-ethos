-- Add missing RLS policies for story_bank
CREATE POLICY "Users can insert stories in their tenant"
ON public.story_bank FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update stories in their tenant"
ON public.story_bank FOR UPDATE
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete stories in their tenant"
ON public.story_bank FOR DELETE
USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Add missing RLS policies for fact_book
CREATE POLICY "Users can insert facts in their tenant"
ON public.fact_book FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update facts in their tenant"
ON public.fact_book FOR UPDATE
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete facts in their tenant"
ON public.fact_book FOR DELETE
USING (tenant_id = get_user_tenant_id(auth.uid()));