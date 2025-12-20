-- Create email templates table for admin-editable templates
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key text NOT NULL UNIQUE,
  name text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  trigger_type text NOT NULL DEFAULT 'manual',
  trigger_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_sent_at timestamp with time zone,
  send_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Super admins can manage templates
CREATE POLICY "Super admins can manage email templates"
ON public.email_templates
FOR ALL
USING (is_super_admin(auth.uid()))
WITH CHECK (is_super_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Track which users have received which auto-triggered emails
CREATE TABLE public.email_sends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES public.email_templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent',
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(template_id, user_id)
);

-- Enable RLS
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

-- Super admins can view all sends
CREATE POLICY "Super admins can view email sends"
ON public.email_sends
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Service role can manage sends
CREATE POLICY "Service role can manage email sends"
ON public.email_sends
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert the default beta feedback template
INSERT INTO public.email_templates (template_key, name, subject, html_content, description, trigger_type, trigger_config)
VALUES (
  'beta_thank_you',
  'Beta Thank You & Feedback Request',
  '🎉 Thank You for Joining UPlaybook.AI Beta!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Thank You!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">We''re thrilled to have you as part of our beta community</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi {{first_name}},</p>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">We noticed you''ve been exploring UPlaybook.AI, and we couldn''t be more grateful! As a beta user, <strong>your experience matters deeply to us</strong>.</p>
    
    <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <p style="color: #92400E; font-size: 15px; margin: 0; font-weight: 600;">💡 Your feedback shapes our product</p>
      <p style="color: #78350F; font-size: 14px; margin: 10px 0 0 0;">During this beta period, every suggestion, bug report, and idea helps us build the best possible tool for higher education communicators like you.</p>
    </div>
    
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">We''d love to hear about:</p>
    <ul style="color: #475569; font-size: 15px; line-height: 1.8;">
      <li>Features you love (or wish existed)</li>
      <li>Anything that felt confusing or could be improved</li>
      <li>How UPlaybook.AI is helping your communication efforts</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{app_url}}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">Share Your Feedback</a>
    </div>
    
    <p style="color: #64748B; font-size: 14px; text-align: center; margin-top: 30px;">It only takes a few minutes, and it means the world to us. 💜</p>
    
    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px;">
      <p style="color: #64748B; font-size: 13px; margin: 0;">With gratitude,</p>
      <p style="color: #334155; font-size: 14px; font-weight: 600; margin: 5px 0 0 0;">The UPlaybook.AI Team</p>
    </div>
  </div>
</div>',
  'Celebratory thank-you email sent 24 hours after first login, encouraging beta feedback',
  'auto',
  '{"delay_hours": 24, "once_per_user": true}'::jsonb
);

-- Insert other default templates
INSERT INTO public.email_templates (template_key, name, subject, html_content, description, trigger_type)
VALUES 
(
  'welcome_invite',
  'New User Welcome',
  'Welcome to UPlaybook.AI - {{institution}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1F2A44;">🎉 Welcome to UPlaybook.AI!</h1>
  <p>Hi {{first_name}},</p>
  <p>You''ve been invited to join UPlaybook.AI as a <strong>{{role}}</strong> for <strong>{{institution}}</strong>.</p>
  <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Email:</strong> {{email}}</p>
    <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> {{password}}</p>
  </div>
  <p style="color: #d97706;"><em>You''ll be prompted to change your password on first login.</em></p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{app_url}}/login" style="background: #4F46E5; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Login to UPlaybook.AI</a>
  </div>
</div>',
  'Welcome email sent to newly invited users',
  'manual'
),
(
  'resend_invite',
  'Resend Invite',
  'Your UPlaybook.AI account is waiting!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1F2A44;">📬 Your Account is Waiting!</h1>
  <p>Hi {{first_name}},</p>
  <p>Your UPlaybook.AI account was created recently, but we haven''t seen you log in yet! <strong>{{institution}}</strong> has given you access to powerful AI-powered communication tools.</p>
  <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 20px 0;">
    <p style="margin: 0; color: #065f46; font-weight: 600;">Here''s what you can do:</p>
    <ul style="color: #047857; margin: 10px 0 0 0;">
      <li>Build AI-powered messages in seconds</li>
      <li>Score your content for effectiveness</li>
      <li>Access your institution''s template library</li>
    </ul>
  </div>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{app_url}}/login" style="background: #10b981; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Get Started Now</a>
  </div>
</div>',
  'Reminder for users who have not logged in yet',
  'manual'
),
(
  'where_have_you_been',
  'Re-engagement (Where Have You Been?)',
  'We haven''t seen you in a while, {{first_name}}! 🤔',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #d97706;">🤔 Where Have You Been?</h1>
  <p>Hi {{first_name}},</p>
  <p>{{inactive_message}}</p>
  <p>We miss having you around and wanted to check in!</p>
  <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
    <p style="margin: 0; color: #92400e; font-weight: 600;">A few things you might have missed:</p>
    <ul style="color: #b45309; margin: 10px 0 0 0;">
      <li>New features and improvements</li>
      <li>Updated templates from your team</li>
      <li>AI improvements for better content</li>
    </ul>
  </div>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{app_url}}/login" style="background: #f59e0b; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Come Back and Explore</a>
  </div>
  <p style="color: #6b7280; font-size: 14px;">We''d love to help you create great content for <strong>{{institution}}</strong>!</p>
</div>',
  'Re-engagement email for inactive users',
  'manual'
);