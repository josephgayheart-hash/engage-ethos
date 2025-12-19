-- Add parent_profile_id for hierarchical profiles (colleges, divisions, units under universities)
ALTER TABLE public.institutional_profiles 
ADD COLUMN parent_profile_id uuid REFERENCES public.institutional_profiles(id) ON DELETE SET NULL;

-- Add profile_type to distinguish between university, college, division, unit
ALTER TABLE public.institutional_profiles 
ADD COLUMN profile_type text NOT NULL DEFAULT 'university';

-- Add index for efficient hierarchy queries
CREATE INDEX idx_institutional_profiles_parent ON public.institutional_profiles(parent_profile_id);
CREATE INDEX idx_institutional_profiles_type ON public.institutional_profiles(profile_type);