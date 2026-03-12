-- Add IEEE membership columns to teams table
-- Run this in your Supabase SQL Editor

-- Add IEEE member columns for all team members (leader and members 2-4)
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS leader_ieee_member BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS leader_ieee_id VARCHAR(255);

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member2_ieee_member BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member2_ieee_id VARCHAR(255);

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member3_ieee_member BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member3_ieee_id VARCHAR(255);

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member4_ieee_member BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member4_ieee_id VARCHAR(255);

-- Create indexes for faster filtering by IEEE membership status
CREATE INDEX IF NOT EXISTS idx_teams_leader_ieee ON teams(leader_ieee_member);
CREATE INDEX IF NOT EXISTS idx_teams_member2_ieee ON teams(member2_ieee_member);
CREATE INDEX IF NOT EXISTS idx_teams_member3_ieee ON teams(member3_ieee_member);
CREATE INDEX IF NOT EXISTS idx_teams_member4_ieee ON teams(member4_ieee_member);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'teams' AND column_name LIKE '%ieee%'
ORDER BY column_name;
