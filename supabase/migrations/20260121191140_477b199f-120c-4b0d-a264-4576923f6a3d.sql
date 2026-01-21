-- Create playbook_kits table for research-backed journey templates
CREATE TABLE public.playbook_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  institution_types text[] DEFAULT ARRAY['all'],
  target_audiences text[],
  target_cohorts text[],
  journey_template jsonb DEFAULT '{}',
  message_templates jsonb DEFAULT '[]',
  best_practices text[],
  research_notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on playbook_kits (read-only for authenticated users)
ALTER TABLE public.playbook_kits ENABLE ROW LEVEL SECURITY;

-- Everyone can read playbook kits
CREATE POLICY "Playbook kits are viewable by authenticated users"
ON public.playbook_kits
FOR SELECT
TO authenticated
USING (is_active = true);

-- Only super_admins can manage playbook kits
CREATE POLICY "Super admins can manage playbook kits"
ON public.playbook_kits
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Create brand_audit_touchpoints table
CREATE TABLE public.brand_audit_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
  profile_id uuid REFERENCES public.institutional_profiles(id),
  user_id uuid NOT NULL,
  touchpoint_type text NOT NULL,
  touchpoint_category text,
  touchpoint_name text NOT NULL,
  content_sample text,
  brand_score integer,
  voice_score integer,
  terminology_issues jsonb DEFAULT '[]',
  analysis_result jsonb,
  status text DEFAULT 'pending',
  remediation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on brand_audit_touchpoints
ALTER TABLE public.brand_audit_touchpoints ENABLE ROW LEVEL SECURITY;

-- Users can view their tenant's touchpoints
CREATE POLICY "Users can view their tenant touchpoints"
ON public.brand_audit_touchpoints
FOR SELECT
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Users can create touchpoints for their tenant
CREATE POLICY "Users can create touchpoints for their tenant"
ON public.brand_audit_touchpoints
FOR INSERT
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

-- Users can update their own touchpoints
CREATE POLICY "Users can update their own touchpoints"
ON public.brand_audit_touchpoints
FOR UPDATE
USING (tenant_id = public.get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

-- Users can delete their own touchpoints
CREATE POLICY "Users can delete their own touchpoints"
ON public.brand_audit_touchpoints
FOR DELETE
USING (tenant_id = public.get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

-- Create brand_audit_reports table
CREATE TABLE public.brand_audit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
  profile_id uuid REFERENCES public.institutional_profiles(id),
  user_id uuid NOT NULL,
  report_date date DEFAULT CURRENT_DATE,
  overall_consistency_score integer,
  touchpoints_audited integer DEFAULT 0,
  top_issues jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  touchpoint_breakdown jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on brand_audit_reports
ALTER TABLE public.brand_audit_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their tenant's reports
CREATE POLICY "Users can view their tenant audit reports"
ON public.brand_audit_reports
FOR SELECT
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Users can create reports for their tenant
CREATE POLICY "Users can create audit reports for their tenant"
ON public.brand_audit_reports
FOR INSERT
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) AND user_id = auth.uid());

-- Create updated_at trigger for brand_audit_touchpoints
CREATE TRIGGER update_brand_audit_touchpoints_updated_at
BEFORE UPDATE ON public.brand_audit_touchpoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial community college playbook kits
INSERT INTO public.playbook_kits (kit_key, name, description, category, institution_types, target_audiences, target_cohorts, journey_template, message_templates, best_practices, research_notes) VALUES
(
  'cc_adult_learner_recruitment',
  'Adult Learner Recruitment Journey',
  'A comprehensive 8-week campaign designed to recruit working adults, parents, and career changers with messaging that acknowledges their unique challenges and celebrates their decision to return to education.',
  'community-college',
  ARRAY['community-college'],
  ARRAY['working-adults', 'parents', 'career-changers', 'veterans'],
  ARRAY['prospective-students', 'inquiry-stage'],
  '{"phases": [{"name": "Awareness", "duration": "2 weeks", "focus": "Visibility and relevance"}, {"name": "Interest", "duration": "2 weeks", "focus": "Program fit and flexibility"}, {"name": "Application", "duration": "2 weeks", "focus": "Simplify the process"}, {"name": "Enrollment", "duration": "2 weeks", "focus": "Remove final barriers"}]}'::jsonb,
  '[{"title": "Life Experience Welcome Email", "channel": "email", "focus": "Acknowledge prior learning and life experience"}, {"title": "Flexible Schedule SMS", "channel": "sms", "focus": "Highlight evening/weekend/online options"}, {"title": "Financial Aid Reminder", "channel": "email", "focus": "Aid availability for working adults"}]'::jsonb,
  ARRAY['Lead with flexibility and convenience', 'Acknowledge competing priorities (work, family)', 'Use simple, jargon-free language', 'Provide clear next steps with low commitment', 'Show success stories of similar students'],
  'Based on Lumina Foundation research on community college brand building: Adult learners need messaging that meets them where they are, acknowledges their life experience, and reduces the perceived risk of returning to education.'
),
(
  'cc_transfer_pathway',
  'Transfer Pathway Communication',
  'A journey framework for communicating transfer opportunities, articulation agreements, and 2+2 pathways to prospective and current students considering university transfer.',
  'community-college',
  ARRAY['community-college'],
  ARRAY['transfer-students', 'current-students', 'prospective-students'],
  ARRAY['sophomore', 'transfer-intent'],
  '{"phases": [{"name": "Exploration", "duration": "Ongoing", "focus": "Discover transfer options"}, {"name": "Advising", "duration": "1-2 months", "focus": "Personalized pathway planning"}, {"name": "Application", "duration": "1 month", "focus": "Application support"}, {"name": "Transition", "duration": "Pre-transfer", "focus": "Preparation for university success"}]}'::jsonb,
  '[{"title": "Transfer Pathway Introduction", "channel": "email", "focus": "Overview of 2+2 and articulation agreements"}, {"title": "Cost Savings Calculator", "channel": "landing-page", "focus": "Show financial benefits of community college start"}, {"title": "Transfer Success Story", "channel": "email", "focus": "Alumni who successfully transferred"}]'::jsonb,
  ARRAY['Emphasize guaranteed admission pathways', 'Highlight cost savings over 4-year path', 'Connect students with transfer advisors early', 'Share transfer student success stories', 'Provide clear credit transfer information'],
  'Transfer pathways represent a key value proposition for community colleges. Clear communication about articulation agreements and success rates builds confidence in the 2+2 model.'
),
(
  'cc_workforce_development',
  'Workforce Development Outreach',
  'A campaign framework for engaging community partners, employers, and prospective students in workforce development, certificate, and short-term credential programs.',
  'community-college',
  ARRAY['community-college'],
  ARRAY['employers', 'community-partners', 'working-adults'],
  ARRAY['workforce-development', 'certificate-seekers'],
  '{"phases": [{"name": "Partnership Initiation", "duration": "Ongoing", "focus": "Employer engagement"}, {"name": "Program Matching", "duration": "2-4 weeks", "focus": "Align needs with programs"}, {"name": "Enrollment", "duration": "1-2 weeks", "focus": "Streamlined registration"}, {"name": "Completion Support", "duration": "Program length", "focus": "Retention and success"}]}'::jsonb,
  '[{"title": "Employer Partnership Pitch", "channel": "email", "focus": "ROI of workforce training"}, {"title": "Skills Gap Analysis", "channel": "consultation", "focus": "Identify training needs"}, {"title": "Certificate Completion Celebration", "channel": "email", "focus": "Recognize achievement"}]'::jsonb,
  ARRAY['Lead with employer outcomes and ROI', 'Emphasize speed to credential', 'Show industry alignment and certifications', 'Provide flexible delivery options', 'Celebrate completions visibly'],
  'Workforce development programs are a critical community college mission. Messaging should emphasize rapid skill acquisition, industry relevance, and economic mobility.'
),
(
  'cc_stop_out_reengagement',
  'Stop-Out Re-engagement Campaign',
  'An 8-12 week re-engagement journey designed to reconnect with students who have stopped out, address barriers to return, and provide a supportive pathway back to completion.',
  'enrollment-decline',
  ARRAY['community-college', 'all'],
  ARRAY['stopped-out-students', 'at-risk-students'],
  ARRAY['lapsed', 'at-risk'],
  '{"phases": [{"name": "Reconnect", "duration": "2 weeks", "focus": "Warm, non-judgmental outreach"}, {"name": "Address Barriers", "duration": "3 weeks", "focus": "Identify and solve obstacles"}, {"name": "Financial Support", "duration": "2 weeks", "focus": "Aid and affordability options"}, {"name": "Re-enrollment", "duration": "2 weeks", "focus": "Clear return pathway"}, {"name": "Welcome Back", "duration": "Ongoing", "focus": "Integration and support"}]}'::jsonb,
  '[{"title": "Warm Re-connection Email", "channel": "email", "focus": "We noticed you have been away - no guilt, just care"}, {"title": "Barrier Assessment SMS", "channel": "sms", "focus": "Quick check-in: What is standing in your way?"}, {"title": "Financial Aid Revival", "channel": "email", "focus": "Aid you may have left on the table"}, {"title": "Easy Return Guide", "channel": "landing-page", "focus": "3 simple steps to re-enroll"}, {"title": "Welcome Back Celebration", "channel": "email", "focus": "Celebrate their return to campus"}]'::jsonb,
  ARRAY['Never shame or guilt - life happens', 'Acknowledge time away as valid', 'Lead with understanding and support', 'Make return process extremely simple', 'Connect with peer mentors who also returned', 'Address common barriers proactively (childcare, work schedule, finances)'],
  'Based on Lumina Foundation research: Stop-out students often leave due to life circumstances, not academic failure. Re-engagement must be warm, barrier-focused, and provide clear, simplified pathways to return. Reduce cognitive load and administrative friction.'
),
(
  'cc_belonging_campaign',
  'Belonging & Community Campaign',
  'A campaign framework designed to foster a sense of belonging among commuter students, first-generation students, and working adults who may feel disconnected from campus life.',
  'community-college',
  ARRAY['community-college'],
  ARRAY['first-gen-students', 'commuter-students', 'working-adults'],
  ARRAY['current-students', 'new-students'],
  '{"phases": [{"name": "Welcome", "duration": "First 2 weeks", "focus": "Warm onboarding and orientation"}, {"name": "Integration", "duration": "First semester", "focus": "Connection opportunities"}, {"name": "Celebration", "duration": "Ongoing", "focus": "Recognize achievements"}, {"name": "Alumni Connection", "duration": "Near completion", "focus": "Build lasting ties"}]}'::jsonb,
  '[{"title": "You Belong Here Email", "channel": "email", "focus": "Affirm their place in the community"}, {"title": "Peer Connection Invitation", "channel": "email", "focus": "Join study groups or clubs"}, {"title": "Achievement Spotlight", "channel": "social", "focus": "Celebrate student milestones"}, {"title": "Alumni Mentor Match", "channel": "email", "focus": "Connect with successful graduates"}]'::jsonb,
  ARRAY['Affirm that all students belong, regardless of background', 'Create low-barrier connection opportunities', 'Celebrate diverse pathways to success', 'Use imagery that reflects student diversity', 'Share stories of students like them', 'Make campus feel welcoming to commuters'],
  'Lumina research emphasizes that community colleges must actively cultivate belonging, especially for commuter and working students who may not experience traditional campus life. Belonging correlates strongly with persistence and completion.'
);