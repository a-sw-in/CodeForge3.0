-- Add phone number columns to the teams table

-- Add phone number for team leader (Member 1)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS leader_phone TEXT;

-- Add phone numbers for Member 2
ALTER TABLE teams ADD COLUMN IF NOT EXISTS member2_phone TEXT;

-- Add phone numbers for Member 3
ALTER TABLE teams ADD COLUMN IF NOT EXISTS member3_phone TEXT;

-- Add phone numbers for Member 4
ALTER TABLE teams ADD COLUMN IF NOT EXISTS member4_phone TEXT;

-- Optional: Add index for phone numbers if you need to search by phone
CREATE INDEX IF NOT EXISTS idx_teams_leader_phone ON teams(leader_phone);

-- Optional: Add comments to describe the columns
COMMENT ON COLUMN teams.leader_phone IS 'Phone number of the team leader';
COMMENT ON COLUMN teams.member2_phone IS 'Phone number of team member 2';
COMMENT ON COLUMN teams.member3_phone IS 'Phone number of team member 3';
COMMENT ON COLUMN teams.member4_phone IS 'Phone number of team member 4';
