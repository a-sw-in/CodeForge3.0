ALTER TABLE teams
DROP COLUMN IF EXISTS leader_is_ucek_student,
DROP COLUMN IF EXISTS leader_admission_number,
DROP COLUMN IF EXISTS member2_is_ucek_student,
DROP COLUMN IF EXISTS member2_admission_number,
DROP COLUMN IF EXISTS member3_is_ucek_student,
DROP COLUMN IF EXISTS member3_admission_number,
DROP COLUMN IF EXISTS member4_is_ucek_student,
DROP COLUMN IF EXISTS member4_admission_number;