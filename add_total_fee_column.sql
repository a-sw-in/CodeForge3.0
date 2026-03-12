-- Add total_fee column to teams table for payment tracking
-- Run this in your Supabase SQL Editor

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS total_fee INTEGER;

-- Create index for filtering by fee amount
CREATE INDEX IF NOT EXISTS idx_teams_total_fee ON teams(total_fee);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'teams' AND column_name = 'total_fee';
