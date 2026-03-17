# Remove UCEK Columns from Database

## Instructions

To remove the UCEK student columns from your Supabase database, follow these steps:

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy and Execute the Migration
1. Open the file `remove_ucek_columns.sql` in this directory
2. Copy all the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Removal
The script will remove the following columns from the `teams` table:
- `leader_is_ucek_student`
- `leader_admission_number`
- `member2_is_ucek_student`
- `member2_admission_number`
- `member3_is_ucek_student`
- `member3_admission_number`
- `member4_is_ucek_student`
- `member4_admission_number`

### Step 4: Clear Browser Cache (Optional)
To ensure your application doesn't use cached data:
1. Clear your browser cache
2. Hard refresh the website (Ctrl+Shift+R in most browsers)

## Verification Query

To verify the columns were successfully removed, run this query in the SQL Editor:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='teams' 
ORDER BY ordinal_position;
```

You should no longer see any columns containing `ucek` or `admission_number`.

## Rollback

If you need to restore the UCEK columns, you'll need to run the migration script from `add_ucek_student.sql` again.

## Notes

- The `IF NOT EXISTS` clause in the migration ensures it won't fail even if columns are already removed
- No data will be affected if you run this script (only structure changes)
- All existing team data will remain intact
