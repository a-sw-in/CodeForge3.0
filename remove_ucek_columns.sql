-- Remove UCEK Student columns from teams table
-- This script removes all UCEK-related columns that were previously added

ALTER TABLE teams
DROP COLUMN IF EXISTS leader_is_ucek_student,
DROP COLUMN IF EXISTS leader_admission_number,
DROP COLUMN IF EXISTS member2_is_ucek_student,
DROP COLUMN IF EXISTS member2_admission_number,
DROP COLUMN IF EXISTS member3_is_ucek_student,
DROP COLUMN IF EXISTS member3_admission_number,
DROP COLUMN IF EXISTS member4_is_ucek_student,
DROP COLUMN IF EXISTS member4_admission_number;

-- Verify columns were removed (optional - can be run separately)
-- SELECT column_name FROM information_schema.columns WHERE table_name='teams' ORDER BY ordinal_position;
