-- Add UCEK student columns to teams table
-- Run this in your Supabase SQL Editor

-- Add UCEK student columns for all team members (leader and members 2-4)
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS leader_is_ucek_student BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS leader_admission_number VARCHAR(255);

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member2_is_ucek_student BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member2_admission_number VARCHAR(255);

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member3_is_ucek_student BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member3_admission_number VARCHAR(255);

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member4_is_ucek_student BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS member4_admission_number VARCHAR(255);

-- Create indexes for faster filtering by UCEK student status
CREATE INDEX IF NOT EXISTS idx_teams_leader_ucek ON teams(leader_is_ucek_student);
CREATE INDEX IF NOT EXISTS idx_teams_member2_ucek ON teams(member2_is_ucek_student);
CREATE INDEX IF NOT EXISTS idx_teams_member3_ucek ON teams(member3_is_ucek_student);
CREATE INDEX IF NOT EXISTS idx_teams_member4_ucek ON teams(member4_is_ucek_student);

-- Create indexes for admission number search
CREATE INDEX IF NOT EXISTS idx_teams_leader_admission ON teams(leader_admission_number);
CREATE INDEX IF NOT EXISTS idx_teams_member2_admission ON teams(member2_admission_number);
CREATE INDEX IF NOT EXISTS idx_teams_member3_admission ON teams(member3_admission_number);
CREATE INDEX IF NOT EXISTS idx_teams_member4_admission ON teams(member4_admission_number);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'teams' AND (column_name LIKE '%ucek%' OR column_name LIKE '%admission%')
ORDER BY column_name;
