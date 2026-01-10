-- Add agency-specific roles to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'agency_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'agency_user';