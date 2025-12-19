-- Create email_nudges table to track sent engagement emails
CREATE TABLE public.email_nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('invite_reminder', 'we_miss_you')),
  email_count INTEGER NOT NULL DEFAULT 1,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_email_nudges_user_type ON public.email_nudges(user_id, nudge_type);
CREATE INDEX idx_email_nudges_sent_at ON public.email_nudges(sent_at);

-- Enable RLS
ALTER TABLE public.email_nudges ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_nudges
CREATE POLICY "Service role can manage all nudges"
ON public.email_nudges
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Super admins can view all nudges"
ON public.email_nudges
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own nudges"
ON public.email_nudges
FOR SELECT
USING (user_id = auth.uid());

-- Create referrals table for colleague invitations
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referrer_tenant_id UUID NOT NULL,
  referee_email TEXT NOT NULL,
  referee_name TEXT,
  referral_type TEXT NOT NULL CHECK (referral_type IN ('same_institution', 'other_institution')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'joined', 'expired')),
  personal_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE
);

-- Create index for referrals
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (referrer_user_id = auth.uid() AND referrer_tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
USING (referrer_user_id = auth.uid());

CREATE POLICY "Admins can view referrals in their tenant"
ON public.referrals
FOR SELECT
USING (referrer_tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can view all referrals"
ON public.referrals
FOR SELECT
USING (is_super_admin(auth.uid()));