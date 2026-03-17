# UCEK Student Toggle Implementation Summary

## Overview
Added a UCEK (University of Calicut Engineering College) student toggle and admission number field to the registration form. When enabled, users must provide their admission number. This data is collected for all team members and stored in the database.

## Changes Made

### 1. Frontend Changes - [src/app/login/page.js](src/app/login/page.js)

#### State Management
- Added two new state variables for the team leader:
  - `isUCEKStudent`: Boolean toggle for UCEK student status
  - `admissionNumber`: String for storing admission number

- Updated `currentMemberData` initial state to include UCEK fields for additional team members:
  - `isUCEKStudent: false`
  - `admissionNumber: ''`

#### UI Changes - Register Form
Added after IEEE Member section:
- **UCEK Student Toggle**: Checkbox to indicate if leader is a UCEK student
- **Admission Number Field**: Conditional text input that appears when toggle is enabled
  - Only visible and required when `isUCEKStudent` is true
  - Green border (#00AA00) for visual distinction
  - Hover shadow effect on focus

#### UI Changes - Team Members Form
Added after IEEE Member section for each additional member:
- Same UCEK Student toggle and Admission Number field
- Updates `currentMemberData` state when changed
- Consistent styling with register form

#### Database Integration
Updated `completeRegistration` function to include UCEK data for all team members:
- Leader columns:
  - `leader_is_ucek_student`: Boolean (default: false)
  - `leader_admission_number`: String (null if not UCEK student)
- Additional members (member2, member3, member4):
  - `memberX_is_ucek_student`: Boolean
  - `memberX_admission_number`: String

#### Form State Management
Updated `handleBack` function to properly reset UCEK states when navigating back through forms.

### 2. Database Changes - [add_ucek_student.sql](add_ucek_student.sql)

Created new migration file with columns for all four team members:

**Leader Columns:**
- `leader_is_ucek_student` (BOOLEAN, DEFAULT: FALSE)
- `leader_admission_number` (VARCHAR(255), NULLABLE)

**Member 2-4 Columns:**
- `memberX_is_ucek_student` (BOOLEAN, DEFAULT: FALSE)
- `memberX_admission_number` (VARCHAR(255), NULLABLE)

**Indexes Added:**
- `idx_teams_leader_ucek` - Filter by UCEK status
- `idx_teams_memberX_ucek` - Filter members by UCEK status
- `idx_teams_leader_admission` - Search by admission number
- `idx_teams_memberX_admission` - Search member admission numbers

## How to Deploy

### 1. Update Database
Run the SQL migration in your Supabase SQL Editor:
```sql
-- Execute the contents of add_ucek_student.sql
```

### 2. Test the Form
1. Go to registration page
2. Fill in leader details
3. Check the "UCEK Student" checkbox
4. Admission Number field will appear and become required
5. Fill in the admission number
6. Add team members with the same UCEK toggle functionality
7. Complete registration

### 3. Verify Data
In Supabase dashboard, check the teams table to confirm:
- New columns exist
- Data is properly saved when UCEK student is selected
- Admission numbers are stored correctly

## Data Flow

```
Registration Form
    ↓
UCEK Student Toggle (checked/unchecked)
    ↓
If checked → Show Admission Number Field
    ↓
User enters admission number
    ↓
Data stored in state and localStorage
    ↓
completeRegistration() function
    ↓
Included in teamData object with new UCEK columns
    ↓
Saved to Supabase teams table
```

## Styling Consistency

- UCEK toggle and IEEE toggle follow same pattern
- Green border (#00AA00) for admission number field (distinct from IEEE ID which uses blue)
- All fields maintain Y2K design theme
- Conditional rendering based on toggle state
- Focus/blur shadow effects for better UX

## Notes

- Admission number is optional unless UCEK student toggle is enabled
- Validation ensures admission number is required when UCEK student is true
- Data is stored for all team members (leader + members 2-4)
- Indexes created for efficient queries on UCEK status and admission numbers
- Migration file follows existing SQL migration pattern in the project
