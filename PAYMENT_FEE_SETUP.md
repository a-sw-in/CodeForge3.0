# Payment Fee Calculation Implementation Guide

## Overview
The payment fee calculation system calculates registration fees based on team size and IEEE membership status. IEEE members receive a ₹100 discount per person.

## Fee Structure
- **IEEE Member**: ₹399 per participant
- **Non-IEEE Member**: ₹499 per participant

**Examples:**
- 2-member team (1 IEEE + 1 Non-IEEE) = ₹399 + ₹499 = ₹898
- 3-member team (all IEEE) = ₹399 × 3 = ₹1,197
- 4-member team (all Non-IEEE) = ₹499 × 4 = ₹1,996

## Frontend Implementation

### New Functions Added

**File:** `src/app/login/page.js`

#### `calculateTotalFee()`
```javascript
const calculateTotalFee = () => {
  let total = 0;
  
  // Leader fee
  total += isIEEEMember ? 399 : 499;
  
  // Additional members fees
  additionalMembers.forEach((member) => {
    total += member.isIEEEMember ? 399 : 499;
  });
  
  return total;
};
```
- Returns total registration fee for entire team
- Checks IEEE membership status of each member
- Called whenever team composition or IEEE status changes

#### `getFeeBreakdown()`
```javascript
const getFeeBreakdown = () => {
  // Returns array of member objects with:
  // { name, isIEEE, fee }
};
```
- Used for displaying detailed fee breakdown
- Shows per-member charges in payment summary

### Display Locations

#### 1. Registration Form (After Password Field)
- **Fee Breakdown Card** showing:
  - Team size
  - IEEE member status (✓ IEEE Member / • Non-IEEE Member)
  - Per-person rate (₹399 or ₹499)
  - **Estimated Total Fee**
- Style: Blue background (#F0F9FF) with blue border (#0055FF)
- Real-time updates as user changes IEEE status

#### 2. Payment Form (Before Payment Screenshots)
- **Payment Summary Card** showing:
  - List of all team members with individual fees
  - IEEE members highlighted with blue background
  - Non-IEEE members highlighted with yellow background
  - **Total Amount Due**
- Detailed breakdown helps users verify charges
- Updated as additional team members are added

### User Experience Flow

1. **Registration Step:**
   ```
   User fills team info → Selects IEEE status → Sees estimated fee
   ```

2. **Team Members Step:**
   ```
   For each member:
   - Fill info → Check IEEE status → Fee updates in real-time
   ```

3. **Payment Step:**
   ```
   View detailed fee breakdown for all members → See total → Upload payment proof
   ```

## Admin Panel Display

**File:** `src/app/admin/dashboard/DashboardContent.js`

### Fee Summary in Team Details Modal
- **Location:** Before payment screenshots section
- Shows:
  - Individual member fees with IEEE status
  - Color-coded: Blue for IEEE members, Yellow for non-IEEE
  - Calculated total fee
- Automatically updates when admin changes IEEE membership status
- Visible in both view and edit modes

## Database Changes

### New Columns Added

**File:** `add_total_fee_column.sql`

```sql
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS total_fee INTEGER;
```

- Stores the calculated total fee
- Can be used for:
  - Revenue reporting
  - Payment verification
  - Financial reconciliation
  - Fee-based queries and filters

### Optional Enhancement
Future implementation could store fee breakdown in database:
```sql
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS fee_breakdown JSONB;

-- Example structure:
{
  "members": [
    {"name": "John", "is_ieee": true, "fee": 399},
    {"name": "Jane", "is_ieee": false, "fee": 499}
  ],
  "total": 898
}
```

## How It Works

### Step-by-Step Process

1. **Team Leader Registration:**
   - User enters basic team info
   - Checks IEEE member checkbox
   - Sees fee breakdown: ₹399 (IEEE) or ₹499 (Non-IEEE)

2. **Additional Team Members:**
   - For each member added:
     - Details entered
     - IEEE status marked
     - Total fee recalculated
   - Example: 2 members (1 IEEE + 1 Non) = ₹898

3. **Payment Step:**
   - User sees detailed breakdown:
     ```
     John (IEEE)        ₹399
     Jane (Non-IEEE)    ₹499
     -------------------
     Total Amount       ₹898
     ```
   - User uploads payment evidence matching the total

4. **Admin Review:**
   - Admin views team details in dashboard
   - Sees fee summary showing each member's charge
   - Can edit IEEE status if needed (fee updates automatically)

## Testing Checklist

- [ ] 2-member team (1 IEEE, 1 Non-IEEE): ₹898 total
- [ ] 3-member team (all IEEE): ₹1,197 total
- [ ] 4-member team (mixed): Correct calculation
- [ ] Fee updates when IEEE status changes
- [ ] Payment form shows correct breakdown
- [ ] Admin panel displays fees properly
- [ ] Admin can edit IEEE status and see fee update
- [ ] All members show on breakdown even if some data is missing

## API & Database Queries

### Getting Total Revenue
```sql
SELECT SUM(total_fee) as total_revenue
FROM teams
WHERE approved = TRUE;
```

### Revenue by IEEE Status
```sql
SELECT 
  CASE 
    WHEN leader_ieee_member = TRUE THEN 'IEEE'
    ELSE 'Non-IEEE'
  END as status,
  COUNT(*) as team_count,
  SUM(CASE WHEN leader_ieee_member = TRUE THEN 399 ELSE 499 END) as revenue
FROM teams
WHERE approved = TRUE
GROUP BY status;
```

### Fee Summary Report
```sql
SELECT 
  team_name,
  total_members,
  CASE 
    WHEN leader_ieee_member = TRUE THEN 'IEEE'
    ELSE 'Non-IEEE'
  END as leader_status,
  total_fee
FROM teams
WHERE approved = TRUE
ORDER BY total_fee DESC;
```

## Integration Notes

- Fee calculation runs **client-side** for real-time display
- No server request needed for calculation
- Database stores `total_fee` for record-keeping
- Can be extended to:
  - Send fee information in confirmation emails
  - Generate invoices automatically
  - Track payment status per fee amount
  - Export fee reports for accounting

## Future Enhancements

1. **Early Bird Discount:** Reduce fee for early registrations
2. **Promo Codes:** Support discount codes
3. **Bulk Discounts:** Reduce fee if team size is large
4. **Payment Plans:** Split payments over multiple installments
5. **Refund Tracking:** Track full/partial refunds
6. **Invoice Generation:** Auto-generate PDF invoices with fee breakdown
7. **Payment Gateway Integration:** Accept online payments with fee calculation
