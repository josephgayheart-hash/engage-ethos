-- Add referral source field to onboarding_requests
ALTER TABLE public.onboarding_requests 
ADD COLUMN referral_source TEXT;