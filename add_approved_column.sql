-- Add approved column to teams table
-- Run this in your Supabase SQL Editor

-- Add the approved column (defaults to FALSE for new teams)
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: Set all existing teams to approved (uncomment if needed)
-- UPDATE teams SET approved = TRUE;

-- Optional: Create an index for faster filtering by approval status
CREATE INDEX IF NOT EXISTS idx_teams_approved ON teams(approved);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'teams' AND column_name = 'approved';
