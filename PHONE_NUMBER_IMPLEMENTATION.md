# Phone Number Collection Implementation

## 📱 Overview
Phone numbers are now collected for all team members (leader and additional members) during registration and stored in the database.

---

## 🔧 Changes Made

### 1. **Database Schema Update**
**File**: `add_phone_numbers.sql`

Added phone number columns to the `teams` table:
- `leader_phone` - Team leader's phone number
- `member2_phone` - Member 2's phone number
- `member3_phone` - Member 3's phone number
- `member4_phone` - Member 4's phone number

### 2. **Registration Form Updates**
**File**: `src/app/login/page.js`

#### State Management:
- Added `phone` state for team leader's phone
- Updated `currentMemberData` to include `phone` field for team members

#### Form Fields Added:
- **Leader Registration Form**: Phone number input after Full Name field
- **Team Member Form**: Phone number input for each additional member
- Validation: 10-digit phone number pattern
- Visual feedback with icons and styling

#### Data Storage:
- Phone numbers are saved to database during registration
- Included in team data structure sent to Supabase

---

## 📋 Setup Instructions

### Step 1: Update Database Schema

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `add_phone_numbers.sql`
5. Click **Run** to execute the migration

**OR** run this SQL directly:

```sql
-- Add phone number columns
ALTER TABLE teams ADD COLUMN IF NOT EXISTS leader_phone TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS member2_phone TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS member3_phone TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS member4_phone TEXT;

-- Add index for searching by phone (optional)
CREATE INDEX IF NOT EXISTS idx_teams_leader_phone ON teams(leader_phone);
```

### Step 2: Test the Registration Flow

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login/registration page

3. Register a new team and verify:
   - Phone number field appears for team leader
   - Phone number field appears for each team member
   - 10-digit validation works
   - Data is saved to database

4. Check Supabase Dashboard:
   - Go to **Table Editor** → **teams**
   - Verify phone numbers are stored in the new columns

---

## 🎨 Form Layout

### Leader Registration Form
```
Email Address
Full Name
Phone Number ← NEW
Team Name
Team Members
Year of Study
Password
```

### Team Member Form
```
Member Name
Member Email
Phone Number ← NEW
Year of Study
```

---

## 🔍 Field Details

### Phone Number Input
- **Type**: `tel` (telephone input)
- **Pattern**: `[0-9]{10}` (exactly 10 digits)
- **Required**: Yes
- **Placeholder**: "9876543210"
- **Icon**: Phone icon
- **Help Text**: "Enter 10-digit phone number"

### Validation Rules
- Must be exactly 10 digits
- Only numeric characters allowed
- Cannot be empty
- Client-side validation with HTML5 pattern attribute

---

## 📊 Database Structure

### Teams Table (Updated)
```
teams
├── id (UUID)
├── team_id (UUID)
├── team_name (TEXT)
├── total_members (INTEGER)
├── password (TEXT)
├── Leader (Member 1)
│   ├── leader_name (TEXT)
│   ├── leader_email (TEXT)
│   ├── leader_phone (TEXT) ← NEW
│   └── leader_year (TEXT)
├── Member 2
│   ├── member2_name (TEXT)
│   ├── member2_email (TEXT)
│   ├── member2_phone (TEXT) ← NEW
│   └── member2_year (TEXT)
├── Member 3
│   ├── member3_name (TEXT)
│   ├── member3_email (TEXT)
│   ├── member3_phone (TEXT) ← NEW
│   └── member3_year (TEXT)
└── Member 4
    ├── member4_name (TEXT)
    ├── member4_email (TEXT)
    ├── member4_phone (TEXT) ← NEW
    └── member4_year (TEXT)
```

---

## 📱 Example Data

After registration, data will look like:

```json
{
  "team_id": "uuid-here",
  "team_name": "Team Phoenix",
  "total_members": 4,
  "leader_name": "John Doe",
  "leader_email": "john@example.com",
  "leader_phone": "9876543210",
  "leader_year": "3rd Year",
  "member2_name": "Jane Smith",
  "member2_email": "jane@example.com",
  "member2_phone": "9876543211",
  "member2_year": "2nd Year",
  "member3_name": "Bob Wilson",
  "member3_email": "bob@example.com",
  "member3_phone": "9876543212",
  "member3_year": "3rd Year",
  "member4_name": "Alice Johnson",
  "member4_email": "alice@example.com",
  "member4_phone": "9876543213",
  "member4_year": "4th Year"
}
```

---

## 🎯 Features

✅ Phone number collection for team leader  
✅ Phone number collection for all team members  
✅ 10-digit validation  
✅ Required field validation  
✅ Clean UI with phone icon  
✅ Stored in database  
✅ Help text for users  
✅ Consistent styling with existing forms  

---

## 🔄 Admin Panel Integration

Phone numbers will now be visible in the admin panel when viewing team details. No additional changes needed - the admin panel automatically displays all team data from the database.

---

## ⚠️ Important Notes

1. **Existing Teams**: Teams registered before this update will have `NULL` phone numbers. You may want to add a migration script or admin tool to collect this data retroactively.

2. **Phone Format**: Currently accepts any 10-digit number. Consider adding country code support in the future if needed.

3. **Privacy**: Phone numbers are stored in plain text. Consider encryption if handling sensitive data in production.

4. **Validation**: Client-side validation only. Add server-side validation in API routes for production security.

---

## 🚀 Future Enhancements

- [ ] Country code dropdown (+91 for India, etc.)
- [ ] Phone number verification via OTP
- [ ] International phone number support
- [ ] Phone number uniqueness validation
- [ ] Privacy settings for phone number visibility
- [ ] WhatsApp integration for notifications

---

## 📞 Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Restart development server
- [ ] Register new team with 2 members
- [ ] Verify phone fields appear for leader
- [ ] Verify phone fields appear for member
- [ ] Try invalid phone (less than 10 digits)
- [ ] Try invalid phone (more than 10 digits)
- [ ] Try non-numeric characters
- [ ] Complete registration successfully
- [ ] Check database for phone numbers
- [ ] Verify admin panel shows phone numbers

---

**Status**: ✅ **Fully Implemented**  
**Last Updated**: March 12, 2026
