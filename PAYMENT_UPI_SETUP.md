# Payment Integration Setup Guide

## Overview
The CodeForge 3.0 payment system integrates UPI (Unified Payments Interface) for receiving payments from participants. The payment interface displays:
- Total amount to be paid (based on team size and IEEE membership)
- UPI ID for direct transfer
- Clickable UPI payment link (for UPI-enabled devices)
- Upload area for payment confirmation screenshots

## Payment Amounts
- **IEEE Member**: ₹399 per participant
- **Non-IEEE Member**: ₹499 per participant
- **Total** = Sum of all team members' fees

## UPI Integration

### What is UPI?
UPI (Unified Payments Interface) allows:**Direct Bank Transfers**: Users can pay directly from their bank account
- **Mobile App Compatible**: Works with Google Pay, PhonePe, Paytm, WhatsApp Pay, etc.
- **No Additional Gateway Fees**: Direct payment to your bank account
- **Universal Format**: Works on all Android devices in India

### UPI Payment Link Format
```
upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tn=NOTE&tr=REFERENCE
```

**Parameters:**
- `pa`: UPI address (your UPI ID)
- `pn`: Payee name (shown to payer)
- `am`: Amount in rupees (integer or decimal)
- `tn`: Transaction note/description (max 80 chars)
- `tr`: Transaction reference ID (unique identifier)

**Example:**
```
upi://pay?pa=myupi@okhdfcbank&pn=CodeForge3.0&am=898&tn=CodeForge3.0-Team1&tr=CF3-1710330000000
```

## Setup Instructions

### Step 1: Get Your UPI ID

**Option A: Personal UPI**
1. Open your bank's mobile app or UPI app (Google Pay, PhonePe, etc.)
2. Navigate to Settings > UPI ID or Receive Money
3. Your UPI ID format: `username@bankname`
   - Example: `john.kumar@icici` or `myname@upi`
4. Note: Personal UPI works, but business/organization UPI is recommended

**Option B: Business/Organization UPI** (Recommended)
1. Contact your bank about setting up a business/organization UPI ID
2. This provides:
   - Professional appearance
   - Better transaction history
   - Organization name display
   - Example: `codeforge@okhdfcbank`

### Step 2: Configure Environment Variables

**File:** `.env.local` (create if doesn't exist)

```bash
# Required: Your UPI ID
NEXT_PUBLIC_UPI_ID=your-upi-id@bankname

# Optional: Display name (defaults to CodeForge3.0)
NEXT_PUBLIC_UPI_NAME=Your Organization Name

# Optional: Razorpay (for enterprise payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-key-id
RAZORPAY_SECRET=your-secret
```

**Important Notes:**
- `NEXT_PUBLIC_*` variables are visible in browser (safe for public UPI ID)
- `.env.local` is added to `.gitignore` (won't be committed)
- Never share `RAZORPAY_SECRET` in public code

### Step 3: Restart Application

```bash
npm run dev
```

Visit the payment page and verify:
- ✅ Total amount displays correctly
- ✅ UPI ID is visible
- ✅ "Copy" button works
- ✅ "Open UPI Payment" link works on mobile

## Payment Flow

### For Users

1. **Registration & Team Setup**
   ```
   Fill team info → Select IEEE status → See estimated fee
   ```

2. **Team Members**
   ```
   Add each member → Check IEEE status → Total updates dynamically
   ```

3. **Payment Page**
   ```
   View total amount (prominently displayed in yellow box)
   ↓
   Option 1: Click "Open UPI Payment" → Redirected to UPI app
   Option 2: Copy UPI ID → Paste in banking app
   ↓
   Complete payment → Screenshot confirmation
   ↓
   Upload screenshot → Submit registration
   ```

### Payment Interface Elements

#### 1. Total Amount Display
- **Style:** Yellow background (#CCFF00) with bold text
- **Size:** Large, prominent (text-2xl)
- **Content:** "TOTAL AMOUNT TO PAY" + amount
- **Purpose:** Clear visibility of what user needs to pay

#### 2. UPI ID Section
- **Display:** Copyable text field with "Copy" button
- **Style:** Blue border (#0055FF)
- **Usable on both:** Desktop and mobile devices
- **Action:** Click "Copy" → Alert confirms

#### 3. UPI Payment Link
- **Display:** Green button "🔗 Open UPI Payment"
- **Behavior:**
  - Desktop: Opens default UPI app with pre-filled details
  - Mobile: Displays list of available UPI apps
  - Redirects user to correct UPI app with amount pre-filled
- **Pre-filled Details:**
  - UPI ID
  - Amount (₹XXX)
  - Reference ID (unique transaction ID)
  - Team name in note

#### 4. Instructions
- Text below payment info:
  "After payment, upload the confirmation screenshot below"

## Technical Details

### Function: `generateUPILink()`

```javascript
const generateUPILink = () => {
  const totalFee = calculateTotalFee();
  const upiId = process.env.NEXT_PUBLIC_UPI_ID;
  const payeeName = process.env.NEXT_PUBLIC_UPI_NAME || 'CodeForge3.0';
  
  if (!upiId) return null;
  
  const note = `CodeForge3.0-${teamName}-${email}`.substring(0, 80);
  const transactionRef = `CF3-${Date.now()}`;
  
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalFee}&tn=${encodeURIComponent(note)}&tr=${transactionRef}`;
  
  return upiLink;
};
```

**Logic:**
1. Get total fee based on team members and IEEE status
2. Retrieve UPI ID from environment (returns null if not set)
3. Create unique transaction reference using timestamp
4. Build UPI link with all details encoded
5. Return link or null if UPI not configured

### Function: `generateRazorpayLink()` (Optional)

For enterprise payment gateway integration:

```javascript
const generateRazorpayLink = async () => {
  const totalFee = calculateTotalFee();
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  
  if (!razorpayKeyId) return null;
  
  return {
    keyId: razorpayKeyId,
    amount: totalFee * 100, // in paise
    currency: 'INR',
    description: `CodeForge 3.0 Registration - ${teamName}`,
    prefill: {
      name: name,
      email: email,
      contact: phone
    }
  };
};
```

## Testing

### Local Testing

**Scenario 1: UPI Configured**
```
.env.local contains:
NEXT_PUBLIC_UPI_ID=test@okhdfcbank
NEXT_PUBLIC_UPI_NAME=CodeForge Test

Expected:
✅ Payment section displays
✅ UPI ID visible
✅ Copy button works
✅ UPI link generates correctly
```

**Scenario 2: UPI Not Configured**
```
.env.local does NOT contain UPI_ID

Expected:
✅ Payment form still works
✅ Payment section hidden
✅ Users upload screenshot directly
```

### Mobile Testing

1. **On Android Phone:**
   - Complete team setup
   - Click "Open UPI Payment"
   - Should show list of UPI apps
   - Select app (Google Pay, PhonePe, etc.)
   - Amount should be pre-filled
   - Complete payment in app

2. **On Desktop:**
   - Complete team setup
   - Copy UPI ID
   - Open banking app on phone
   - Paste UPI ID
   - Complete payment

## Handling Payments

### After User Submits

1. **Screenshot Uploaded**
   - Stored in Supabase storage
   - Admin can view in team details

2. **Admin Panel Review**
   - View fee summary
   - View payment screenshot
   - Approve/reject registration
   - Mark as verified

### Transaction Verification

1. **Bank Account**
   - Check bank statements
   - Verify transaction reference ID (CF3-XXXXX)
   - Match with team registration

2. **Database**
   - Fee stored in `total_fee` column
   - Team marked as approved after payment verified

## Database Schema

### Teams Table

```sql
-- Existing columns
team_id UUID
team_name VARCHAR
total_members INTEGER
payment_screenshot_urls JSONB

-- Added for payment
total_fee INTEGER        -- Auto-calculated on registration
leader_ieee_member BOOLEAN
member2_ieee_member BOOLEAN
member3_ieee_member BOOLEAN
member4_ieee_member BOOLEAN
```

**Calculation Logic:**
```
total_fee = (leader_ieee_member ? 399 : 499) +
            (member2_ieee_member ? 399 : 499) +
            (member3_ieee_member ? 399 : 499) +
            (member4_ieee_member ? 399 : 499)
```

## Revenue Reporting Queries

### Total Revenue
```sql
SELECT SUM(total_fee) as total_revenue
FROM teams
WHERE approved = TRUE;
```

### Revenue by IEEE Status
```sql
SELECT 
  COUNT(*) as teams,
  SUM(total_fee) as total_revenue,
  AVG(total_fee) as average_fee
FROM teams
WHERE approved = TRUE;
```

### Payment Status Report
```sql
SELECT 
  team_name,
  leader_name,
  total_members,
  total_fee,
  approved,
  payment_screenshot_urls
FROM teams
ORDER BY created_at DESC;
```

## Security Considerations

### What's Safe to Expose
- ✅ `NEXT_PUBLIC_UPI_ID` - Public information
- ✅ `NEXT_PUBLIC_UPI_NAME` - Organization name
- ✅ `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Can be public

### What Must Be Hidden
- ❌ `RAZORPAY_SECRET` - Never expose in browser
- ❌ Bank account details - Only use UPI ID
- ❌ Admin credentials - Store in `.env.local` only

### Best Practices
1. Never commit `.env.local`
2. Use `.env.example` for documentation only
3. Rotate passwords/keys periodically
4. Use organization/business UPI ID (not personal)
5. Monitor transaction references for fraud

## Troubleshooting

### Problem: UPI Payment Link Not Working

**Solution 1: Check Environment Variable**
```bash
# In .env.local
NEXT_PUBLIC_UPI_ID=yourname@bankname
```

**Solution 2: Verify Format**
- UPI format must be: `username@bankname`
- Valid examples: `john@icici`, `demo@upi`, `corp@okaxis`
- Invalid: `john.kumar`, `my-upi`, `@bankname`

**Solution 3: Test on Mobile**
- Desktop might not have UPI app
- UPI links work best on Android with UPI apps installed
- Ensure at least one UPI app is installed

### Problem: Amount Not Updating

**Solution:**
- Refresh page after adding team members
- Check IEEE status is saved correctly
- Clear browser cache if stuck

### Problem: Copy Button Not Working

**Solution:**
- Works only in HTTPS or localhost
- Check browser console for errors
- Fallback: Manually select and copy UPI ID

## Future Enhancements

1. **QR Code Generation**
   - Display UPI as QR code
   - Easier for mobile users

2. **Payment Verification**
   - Auto-verify via bank API
   - Reduce manual screenshot review

3. **Email Confirmation**
   - Send payment link via email
   - Include QR code in email

4. **Multiple Payment Methods**
   - Credit/Debit card (via Razorpay)
   - NetBanking
   - Wallet payments

5. **Refund Processing**
   - Track refunds
   - Auto-reverse transactions
   - Update fee records

6. **Discount Codes**
   - Apply promotional codes
   - Reduce calculated fee
   - Update payment amount dynamically

## Support

For issues or questions:
1. Check this documentation first
2. Review `.env.example` for setup
3. Test on mobile device for UPI links
4. Check browser console for errors
5. Verify environment variables are set correctly
