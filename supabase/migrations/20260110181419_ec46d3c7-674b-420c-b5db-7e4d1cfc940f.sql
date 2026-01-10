-- Add new columns to sales_prospects for enhanced contact tracking
ALTER TABLE sales_prospects 
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS extracted_contacts jsonb;

-- Create outreach_history table for tracking all outreach attempts
CREATE TABLE IF NOT EXISTS outreach_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id uuid REFERENCES sales_prospects(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'linkedin_dm')),
  subject text,
  body text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  created_by_user_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on outreach_history
ALTER TABLE outreach_history ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage outreach history
CREATE POLICY "Allow authenticated users to manage outreach history"
ON outreach_history FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);