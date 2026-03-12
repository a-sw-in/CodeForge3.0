# IEEE Membership & Payment Fee Implementation Guide

## Overview
This guide explains the IEEE membership feature and payment fee calculation that has been added to the CodeForge 3.0 registration system. Users can mark themselves (and team members) as IEEE members and will receive a discounted rate (₹399 vs ₹499 for non-members).

## Changes Made

### 1. Frontend Changes
**File:** `src/app/login/page.js`

#### State Variables Added:
- `isIEEEMember`: Boolean to track if the team leader is an IEEE member
- `ieeeId`: String to store the team leader's IEEE membership ID
- Updated `currentMemberData` to include `isIEEEMember` and `ieeeId` for team members

#### Form Fields Added:
1. **Registration Form (Team Leader)**
   - IEEE Member checkbox
   - Conditional IEEE Membership ID input field (only shows when checkbox is checked)
   - Location: After password field

2. **Team Members Form**
   - IEEE Member checkbox for each team member
   - Conditional IEEE Membership ID input field
   - Location: After year of study dropdown

#### Features:
- Conditional rendering: IEEE membership ID field only appears when the checkbox is marked
- Validation: IEEE membership ID is required if the member is marked as IEEE member
- Reset: Form properly resets all IEEE fields when going back or starting over
- Styling: Matches the existing Y2K design theme

### 2. Database Changes
**File:** `add_ieee_membership.sql`

#### New Columns Added:
```sql
-- Leader IEEE membership
leader_ieee_member (BOOLEAN)
leader_ieee_id (VARCHAR)

-- Member 2 IEEE membership
member2_ieee_member (BOOLEAN)
member2_ieee_id (VARCHAR)

-- Member 3 IEEE membership
member3_ieee_member (BOOLEAN)
member3_ieee_id (VARCHAR)

-- Member 4 IEEE membership
member4_ieee_member (BOOLEAN)
member4_ieee_id (VARCHAR)
```

#### Indexes Created:
- `idx_teams_leader_ieee`: For filtering teams by leader IEEE status
- `idx_teams_member2_ieee`: For member 2 IEEE status
- `idx_teams_member3_ieee`: For member 3 IEEE status
- `idx_teams_member4_ieee`: For member 4 IEEE status

## How to Use

### For Users (Registration):
1. **Team Leader Registration:**
   - Fill in all required fields (email, name, phone, team name, etc.)
   - Check "IEEE Member" checkbox if applicable
   - If checked, enter your IEEE membership ID in the required field
   - Click "Next" to continue

2. **Team Members Registration:**
   - For each team member, fill in name, email, phone, year of study
   - Check "IEEE Member" checkbox if applicable
   - If checked, enter their IEEE membership ID
   - Click "Next Member" or "Next: Payment" to continue

### For Admins:
IEEE membership data is stored in the following columns:
- `leader_ieee_member`, `leader_ieee_id`
- `member2_ieee_member`, `member2_ieee_id`
- `member3_ieee_member`, `member3_ieee_id`
- `member4_ieee_member`, `member4_ieee_id`

Use these columns to:
- Filter teams by IEEE membership (useful for special IEEE benefits)
- Verify IEEE membership IDs
- Generate reports on IEEE member participation
- Apply IEEE-specific rules or discounts

## Database Setup

To apply these changes to your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy the contents of `add_ieee_membership.sql`
5. Execute the query
6. Verify all columns were added successfully

```sql
-- Run this query to verify:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'teams' AND column_name LIKE '%ieee%'
ORDER BY column_name;
```

## Data Structure

### Example Team Data in Database:
```json
{
  "team_id": "abc123",
  "team_name": "Team Phoenix",
  "leader_name": "John Doe",
  "leader_email": "john@example.com",
  "leader_ieee_member": true,
  "leader_ieee_id": "IEEE123456",
  "member2_name": "Jane Smith",
  "member2_ieee_member": false,
  "member2_ieee_id": null,
  "member3_name": "Bob Johnson",
  "member3_ieee_member": true,
  "member3_ieee_id": "IEEE789012",
  "member4_name": null,
  "member4_ieee_member": false,
  "member4_ieee_id": null
}
```

## Testing Checklist

- [ ] Create a new team with IEEE member leader
- [ ] Verify IEEE membership ID is required when checkbox is checked
- [ ] Create a team with mixed IEEE members (some yes, some no)
- [ ] Navigate back through steps and verify IEEE data persists
- [ ] Check that non-IEEE members show `is_member: false` and `id: null` in database
- [ ] Verify team data is correctly saved in Supabase
- [ ] Test with 2, 3, and 4 member teams

## Frontend UI Details

### IEEE Member Checkbox:
- Style: Matches existing form elements
- Color: Accent color #0055FF (IEEE blue)
- Position: Below "Year of Study" field

### IEEE ID Input Field:
- Only visible when "IEEE Member" is checked
- Icon: Hash icon (#)
- Color: Special #0055FF border to indicate IEEE-specific field
- Placeholder: "Enter IEEE membership ID"
- Required: Only when checkbox is checked

## Notes

- IEEE membership ID is optional if the checkbox is unchecked
- The system stores both boolean flag and ID for each member
- Conditional rendering prevents confusion by only showing ID field when needed
- All existing teams will have `ieee_member = false` and `ieee_id = null` by default
- Future features can use this data for IEEE-specific event benefits or reporting

## Integration with Admin Panel

The admin panel can be updated to:
- Display IEEE membership status for each team member
- Filter teams by IEEE membership
- Generate IEEE member lists for special ceremonies or programs
- Export IEEE member data for IEEE chapter coordination

Example query to get all IEEE members:
```sql
SELECT 
  team_id, team_name, leader_name, leader_ieee_id,
  member2_name, member2_ieee_id,
  member3_name, member3_ieee_id,
  member4_name, member4_ieee_id
FROM teams
WHERE approved = TRUE 
  AND (leader_ieee_member = TRUE 
    OR member2_ieee_member = TRUE 
    OR member3_ieee_member = TRUE 
    OR member4_ieee_member = TRUE);
```
