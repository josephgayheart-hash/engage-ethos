CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user',
    'approver',
    'super_admin'
);


--
-- Name: onboarding_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.onboarding_status AS ENUM (
    'submitted',
    'approved',
    'rejected'
);


--
-- Name: tenant_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tenant_status AS ENUM (
    'active',
    'inactive'
);


--
-- Name: user_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status AS ENUM (
    'invited',
    'pending',
    'active',
    'locked',
    'disabled'
);


--
-- Name: get_user_tenant_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_tenant_id(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: is_super_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_super_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;


--
-- Name: is_user_active(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_user_active(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND status = 'active'
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    actor_user_id uuid,
    action text NOT NULL,
    target_type text,
    target_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: beta_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.beta_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    feature_area text NOT NULL,
    page_path text,
    feedback_type text DEFAULT 'general'::text NOT NULL,
    feedback_text text NOT NULL,
    rating integer,
    status text DEFAULT 'new'::text NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    CONSTRAINT beta_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: byoc_uploads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.byoc_uploads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    file_name text NOT NULL,
    file_type text,
    file_size integer,
    content_text text,
    tags text[] DEFAULT '{}'::text[],
    evaluation_result jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: content_dna_samples; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_dna_samples (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    profile_id uuid,
    file_name text NOT NULL,
    file_type text,
    file_size integer,
    content_text text,
    source_type text DEFAULT 'upload'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: institutional_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutional_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: institutional_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutional_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    created_by_user_id uuid,
    name text NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invite_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invite_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    email text NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_by_admin_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: onboarding_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    department text,
    title text,
    institution_name_input text,
    request_status public.onboarding_status DEFAULT 'submitted'::public.onboarding_status NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_by_admin_user_id uuid,
    reviewed_at timestamp with time zone,
    notes text
);


--
-- Name: personal_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    channel text NOT NULL,
    audience text,
    domain text,
    moment text,
    goal text,
    tone text,
    sender_recommendation text,
    mode text,
    approved boolean DEFAULT false,
    notes text,
    institutional_profile_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    status public.user_status DEFAULT 'pending'::public.user_status NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    department text,
    title text,
    password_reset_required boolean DEFAULT true NOT NULL,
    last_password_reset_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login_at timestamp with time zone
);


--
-- Name: shared_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shared_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    created_by_user_id uuid,
    title text NOT NULL,
    intent_statement text,
    content text NOT NULL,
    use_cases jsonb DEFAULT '{}'::jsonb,
    placeholders jsonb DEFAULT '[]'::jsonb,
    required_fields jsonb DEFAULT '{}'::jsonb,
    variants jsonb DEFAULT '[]'::jsonb,
    ethical_guardrails text[],
    owner text,
    maintainer text,
    status text DEFAULT 'draft'::text NOT NULL,
    version text DEFAULT '1.0'::text,
    approval_notes text,
    playbook text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    institution_name text NOT NULL,
    status public.tenant_status DEFAULT 'active'::public.tenant_status NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#1F2A44'::text,
    accent_color text DEFAULT '#2C7A7B'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tool_usage_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_usage_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    tool_name text NOT NULL,
    action text DEFAULT 'use'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: beta_feedback beta_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_feedback
    ADD CONSTRAINT beta_feedback_pkey PRIMARY KEY (id);


--
-- Name: byoc_uploads byoc_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.byoc_uploads
    ADD CONSTRAINT byoc_uploads_pkey PRIMARY KEY (id);


--
-- Name: content_dna_samples content_dna_samples_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_dna_samples
    ADD CONSTRAINT content_dna_samples_pkey PRIMARY KEY (id);


--
-- Name: institutional_config institutional_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_config
    ADD CONSTRAINT institutional_config_pkey PRIMARY KEY (id);


--
-- Name: institutional_config institutional_config_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_config
    ADD CONSTRAINT institutional_config_tenant_id_key UNIQUE (tenant_id);


--
-- Name: institutional_profiles institutional_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_profiles
    ADD CONSTRAINT institutional_profiles_pkey PRIMARY KEY (id);


--
-- Name: invite_tokens invite_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_tokens
    ADD CONSTRAINT invite_tokens_pkey PRIMARY KEY (id);


--
-- Name: invite_tokens invite_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_tokens
    ADD CONSTRAINT invite_tokens_token_key UNIQUE (token);


--
-- Name: onboarding_requests onboarding_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_requests
    ADD CONSTRAINT onboarding_requests_pkey PRIMARY KEY (id);


--
-- Name: personal_messages personal_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_messages
    ADD CONSTRAINT personal_messages_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: shared_templates shared_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_templates
    ADD CONSTRAINT shared_templates_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tool_usage_events tool_usage_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_usage_events
    ADD CONSTRAINT tool_usage_events_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_tenant_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_tenant_id_role_key UNIQUE (user_id, tenant_id, role);


--
-- Name: idx_audit_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_created_at ON public.audit_log USING btree (created_at DESC);


--
-- Name: idx_audit_log_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_tenant_id ON public.audit_log USING btree (tenant_id);


--
-- Name: idx_beta_feedback_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beta_feedback_created ON public.beta_feedback USING btree (created_at DESC);


--
-- Name: idx_beta_feedback_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beta_feedback_status ON public.beta_feedback USING btree (status);


--
-- Name: idx_beta_feedback_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_beta_feedback_tenant ON public.beta_feedback USING btree (tenant_id);


--
-- Name: idx_byoc_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_byoc_created_at ON public.byoc_uploads USING btree (created_at DESC);


--
-- Name: idx_byoc_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_byoc_tenant_id ON public.byoc_uploads USING btree (tenant_id);


--
-- Name: idx_content_dna_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_dna_created_at ON public.content_dna_samples USING btree (created_at DESC);


--
-- Name: idx_content_dna_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_dna_tenant_id ON public.content_dna_samples USING btree (tenant_id);


--
-- Name: idx_invite_tokens_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_tokens_email ON public.invite_tokens USING btree (email);


--
-- Name: idx_invite_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invite_tokens_token ON public.invite_tokens USING btree (token);


--
-- Name: idx_onboarding_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_onboarding_requests_status ON public.onboarding_requests USING btree (request_status);


--
-- Name: idx_onboarding_requests_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_onboarding_requests_tenant_id ON public.onboarding_requests USING btree (tenant_id);


--
-- Name: idx_profiles_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);


--
-- Name: idx_profiles_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_tenant_id ON public.profiles USING btree (tenant_id);


--
-- Name: idx_tool_usage_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tool_usage_created_at ON public.tool_usage_events USING btree (created_at DESC);


--
-- Name: idx_tool_usage_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tool_usage_tenant_id ON public.tool_usage_events USING btree (tenant_id);


--
-- Name: idx_tool_usage_tool_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tool_usage_tool_name ON public.tool_usage_events USING btree (tool_name);


--
-- Name: idx_user_roles_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_tenant_id ON public.user_roles USING btree (tenant_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: institutional_config update_institutional_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_institutional_config_updated_at BEFORE UPDATE ON public.institutional_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: institutional_profiles update_institutional_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_institutional_profiles_updated_at BEFORE UPDATE ON public.institutional_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: personal_messages update_personal_messages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_personal_messages_updated_at BEFORE UPDATE ON public.personal_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shared_templates update_shared_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shared_templates_updated_at BEFORE UPDATE ON public.shared_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tenants update_tenants_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: audit_log audit_log_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: audit_log audit_log_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: beta_feedback beta_feedback_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.beta_feedback
    ADD CONSTRAINT beta_feedback_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: byoc_uploads byoc_uploads_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.byoc_uploads
    ADD CONSTRAINT byoc_uploads_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: content_dna_samples content_dna_samples_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_dna_samples
    ADD CONSTRAINT content_dna_samples_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.institutional_profiles(id) ON DELETE SET NULL;


--
-- Name: content_dna_samples content_dna_samples_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_dna_samples
    ADD CONSTRAINT content_dna_samples_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: institutional_config institutional_config_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_config
    ADD CONSTRAINT institutional_config_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: institutional_profiles institutional_profiles_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_profiles
    ADD CONSTRAINT institutional_profiles_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id);


--
-- Name: institutional_profiles institutional_profiles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutional_profiles
    ADD CONSTRAINT institutional_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: invite_tokens invite_tokens_created_by_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_tokens
    ADD CONSTRAINT invite_tokens_created_by_admin_user_id_fkey FOREIGN KEY (created_by_admin_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: invite_tokens invite_tokens_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invite_tokens
    ADD CONSTRAINT invite_tokens_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: onboarding_requests onboarding_requests_reviewed_by_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_requests
    ADD CONSTRAINT onboarding_requests_reviewed_by_admin_user_id_fkey FOREIGN KEY (reviewed_by_admin_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: onboarding_requests onboarding_requests_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_requests
    ADD CONSTRAINT onboarding_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: personal_messages personal_messages_institutional_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_messages
    ADD CONSTRAINT personal_messages_institutional_profile_id_fkey FOREIGN KEY (institutional_profile_id) REFERENCES public.institutional_profiles(id);


--
-- Name: personal_messages personal_messages_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_messages
    ADD CONSTRAINT personal_messages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: shared_templates shared_templates_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_templates
    ADD CONSTRAINT shared_templates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tool_usage_events tool_usage_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_usage_events
    ADD CONSTRAINT tool_usage_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: shared_templates Admins can delete shared templates in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete shared templates in their tenant" ON public.shared_templates FOR DELETE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Admins can insert profiles in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert profiles in their tenant" ON public.profiles FOR INSERT TO authenticated WITH CHECK (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: institutional_config Admins can manage config for their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage config for their tenant" ON public.institutional_config TO authenticated USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: invite_tokens Admins can manage invite tokens in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage invite tokens in their tenant" ON public.invite_tokens TO authenticated USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Admins can manage roles in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles in their tenant" ON public.user_roles TO authenticated USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Admins can update profiles in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update profiles in their tenant" ON public.profiles FOR UPDATE TO authenticated USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: shared_templates Admins can update shared templates in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update shared templates in their tenant" ON public.shared_templates FOR UPDATE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: tenants Admins can update their own tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update their own tenant" ON public.tenants FOR UPDATE TO authenticated USING (((id = public.get_user_tenant_id(auth.uid())) AND public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: onboarding_requests Anyone can submit onboarding request; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit onboarding request" ON public.onboarding_requests FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: institutional_config Super admins can create institutional config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can create institutional config" ON public.institutional_config FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));


--
-- Name: tenants Super admins can create tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can create tenants" ON public.tenants FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));


--
-- Name: beta_feedback Super admins can update feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can update feedback" ON public.beta_feedback FOR UPDATE USING (public.is_super_admin(auth.uid()));


--
-- Name: onboarding_requests Super admins can update onboarding requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can update onboarding requests" ON public.onboarding_requests FOR UPDATE USING (public.is_super_admin(auth.uid()));


--
-- Name: byoc_uploads Super admins can view all BYOC uploads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all BYOC uploads" ON public.byoc_uploads FOR SELECT USING (public.is_super_admin(auth.uid()));


--
-- Name: content_dna_samples Super admins can view all content DNA samples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all content DNA samples" ON public.content_dna_samples FOR SELECT USING (public.is_super_admin(auth.uid()));


--
-- Name: beta_feedback Super admins can view all feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all feedback" ON public.beta_feedback FOR SELECT USING (public.is_super_admin(auth.uid()));


--
-- Name: onboarding_requests Super admins can view all onboarding requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all onboarding requests" ON public.onboarding_requests FOR SELECT USING (public.is_super_admin(auth.uid()));


--
-- Name: personal_messages Super admins can view all personal messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all personal messages" ON public.personal_messages FOR SELECT USING (public.is_super_admin(auth.uid()));


--
-- Name: shared_templates Super admins can view all shared templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all shared templates" ON public.shared_templates FOR SELECT USING (public.is_super_admin(auth.uid()));


--
-- Name: audit_log System can insert audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert audit logs" ON public.audit_log FOR INSERT TO authenticated WITH CHECK ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: personal_messages Users can create personal messages in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create personal messages in their tenant" ON public.personal_messages FOR INSERT WITH CHECK (((tenant_id = public.get_user_tenant_id(auth.uid())) AND (user_id = auth.uid())));


--
-- Name: institutional_profiles Users can create profiles in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create profiles in their tenant" ON public.institutional_profiles FOR INSERT WITH CHECK ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: shared_templates Users can create shared templates in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create shared templates in their tenant" ON public.shared_templates FOR INSERT WITH CHECK ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: personal_messages Users can delete their own personal messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own personal messages" ON public.personal_messages FOR DELETE USING (((user_id = auth.uid()) AND (tenant_id = public.get_user_tenant_id(auth.uid()))));


--
-- Name: institutional_profiles Users can delete their own profiles or admins can delete any; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own profiles or admins can delete any" ON public.institutional_profiles FOR DELETE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND ((created_by_user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))));


--
-- Name: tool_usage_events Users can insert their own tool usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own tool usage" ON public.tool_usage_events FOR INSERT WITH CHECK ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: byoc_uploads Users can manage their tenant BYOC uploads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their tenant BYOC uploads" ON public.byoc_uploads USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: content_dna_samples Users can manage their tenant content DNA samples; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their tenant content DNA samples" ON public.content_dna_samples USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: beta_feedback Users can submit feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit feedback" ON public.beta_feedback FOR INSERT WITH CHECK (((tenant_id = public.get_user_tenant_id(auth.uid())) AND (user_id = auth.uid())));


--
-- Name: institutional_profiles Users can update profiles in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update profiles in their tenant" ON public.institutional_profiles FOR UPDATE USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: personal_messages Users can update their own personal messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own personal messages" ON public.personal_messages FOR UPDATE USING (((user_id = auth.uid()) AND (tenant_id = public.get_user_tenant_id(auth.uid()))));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((id = auth.uid())) WITH CHECK (((id = auth.uid()) AND (tenant_id = public.get_user_tenant_id(auth.uid()))));


--
-- Name: audit_log Users can view audit logs in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view audit logs in their tenant" ON public.audit_log FOR SELECT TO authenticated USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: institutional_config Users can view config for their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view config for their tenant" ON public.institutional_config FOR SELECT TO authenticated USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: tool_usage_events Users can view own tenant usage or super admins can view all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own tenant usage or super admins can view all" ON public.tool_usage_events FOR SELECT USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: personal_messages Users can view personal messages in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view personal messages in their tenant" ON public.personal_messages FOR SELECT USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: institutional_profiles Users can view profiles in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view profiles in their tenant" ON public.institutional_profiles FOR SELECT USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: profiles Users can view profiles in their tenant or super admins can vie; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view profiles in their tenant or super admins can vie" ON public.profiles FOR SELECT USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: user_roles Users can view roles in their tenant or super admins can view a; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view roles in their tenant or super admins can view a" ON public.user_roles FOR SELECT USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: shared_templates Users can view shared templates in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view shared templates in their tenant" ON public.shared_templates FOR SELECT USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: beta_feedback Users can view their own feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own feedback" ON public.beta_feedback FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: tenants Users can view their own tenant or super admins can view all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own tenant or super admins can view all" ON public.tenants FOR SELECT USING (((id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: beta_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: byoc_uploads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.byoc_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: content_dna_samples; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_dna_samples ENABLE ROW LEVEL SECURITY;

--
-- Name: institutional_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.institutional_config ENABLE ROW LEVEL SECURITY;

--
-- Name: institutional_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.institutional_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: invite_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: personal_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.personal_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: shared_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: tenants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: tool_usage_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tool_usage_events ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


