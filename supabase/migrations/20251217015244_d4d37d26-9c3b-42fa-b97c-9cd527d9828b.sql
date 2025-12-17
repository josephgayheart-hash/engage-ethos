-- Add 'approver' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'approver';

-- Update has_role function to work with new role (no changes needed, it's generic)