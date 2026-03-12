-- Add ticket_number column to teams table
-- Run this in your Supabase SQL Editor

-- Add the ticket_number column (stores 6-digit alphanumeric ticket code)
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS ticket_number VARCHAR(6) UNIQUE;

-- Optional: Create an index for faster lookups by ticket number
CREATE INDEX IF NOT EXISTS idx_teams_ticket_number ON teams(ticket_number);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'teams' AND column_name = 'ticket_number';
