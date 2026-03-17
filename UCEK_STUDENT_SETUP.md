# UCEK Student Setup Instructions

## Quick Setup

### Step 1: Run Database Migration
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `add_ucek_student.sql`
5. Click **Run** to execute

The migration will add 8 new columns to your teams table:
- Leader: `leader_is_ucek_student` and `leader_admission_number`
- Members 2-4: Similar columns for each additional team member

### Step 2: Verify Installation
Check your Supabase dashboard:
1. Go to **Table Editor**
2. Select **teams** table
3. Scroll right to verify new columns are present
4. Columns should be visible with proper data types (BOOLEAN and VARCHAR)

### Step 3: Test the Form
1. Clear your browser cache/localStorage for the registration form
2. Go to the registration page
3. Fill in your details as normal
4. After IEEE Member section, you'll see:
   - ☐ UCEK Student (checkbox)
5. Check the box
6. An "Admission Number" field will appear
7. Enter your admission number
8. Continue registration

### Step 4: Verify Data Storage
1. Complete a test registration
2. Go to Supabase Dashboard → Table Editor → Teams
3. Open the newly created team entry
4. Scroll right to verify:
   - `leader_is_ucek_student` = true/false
   - `leader_admission_number` = your entry or null
   - Similar fields for additional members

## Form Behavior

### When UCEK Student is Unchecked:
- Admission Number field is hidden
- Not required
- Stored as NULL in database

### When UCEK Student is Checked:
- Admission Number field appears
- Required to fill
- Must contain a value to proceed
- Stored in database

## Column Details

| Column Name | Type | Nullable | Default | Purpose |
|---|---|---|---|---|
| leader_is_ucek_student | BOOLEAN | NO | FALSE | Leader UCEK status |
| leader_admission_number | VARCHAR(255) | YES | NULL | Leader's admission number |
| member2_is_ucek_student | BOOLEAN | NO | FALSE | Member 2 UCEK status |
| member2_admission_number | VARCHAR(255) | YES | NULL | Member 2's admission number |
| member3_is_ucek_student | BOOLEAN | NO | FALSE | Member 3 UCEK status |
| member3_admission_number | VARCHAR(255) | YES | NULL | Member 3's admission number |
| member4_is_ucek_student | BOOLEAN | NO | FALSE | Member 4 UCEK status |
| member4_admission_number | VARCHAR(255) | YES | NULL | Member 4's admission number |

## Troubleshooting

### Column Not Appearing in Form
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### Database Columns Not Created
- Verify you ran the SQL migration
- Check Supabase SQL Editor for error messages
- Ensure you have proper permissions

### Admission Number Not Saving
- Check that UCEK Student toggle is checked
- Verify you filled in the field (it's required)
- Check browser console for validation errors

## API Response Example

When a team registers with UCEK student data, the response includes:
```json
{
  "team_id": "uuid-here",
  "team_name": "Team Name",
  "leader_is_ucek_student": true,
  "leader_admission_number": "UC2023001",
  "member2_is_ucek_student": false,
  "member2_admission_number": null,
  ...
}
```

## Notes

- Both UCEK status and admission number are included for all team members
- Data is stored separately for leader + up to 3 additional members
- Admission number field only shows when UCEK toggle is active
- Admission numbers can be searched using database indexes
- Migration file uses `IF NOT EXISTS` to prevent duplicate columns
