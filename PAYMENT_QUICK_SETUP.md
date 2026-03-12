# Quick Payment Setup Guide

## 📦 What You Need

A UPI ID to receive payments (e.g., `myupi@okhdfcbank`)

## ⚡ Quick Start (2 Steps)

### Step 1: Create `.env.local` file

Create a new file in the root directory: `.env.local`

```env
NEXT_PUBLIC_UPI_ID=your-upi@bankname
NEXT_PUBLIC_UPI_NAME=Your Organization Name
```

**Find Your UPI ID:**
- Open Google Pay, PhonePe, or your bank app
- Go to Settings → UPI ID or Receive Money
- Copy your UPI ID (format: `username@bankname`)

**Example:**
```env
NEXT_PUBLIC_UPI_ID=codeforge@okhdfcbank
NEXT_PUBLIC_UPI_NAME=CodeForge3.0 Committee
```

### Step 2: Restart Application

```bash
npm run dev
```

✅ Done! The payment interface will now show:
- **Total amount** in a yellow box
- **UPI ID** with copy button
- **UPI Payment link** button for mobile users

## 🧪 Testing

### Test Payment Interface (Local)

1. Visit: `http://localhost:3000/login`
2. Complete registration (select team size, use test data)
3. Navigate to payment page
4. Verify you see:
   - ✅ Total amount (e.g., ₹898, ₹1197)
   - ✅ Your UPI ID displayed
   - ✅ "Open UPI Payment" button

### Test Payment Link (Mobile)

1. Complete registration on mobile device
2. On payment page, click "🔗 Open UPI Payment"
3. Should open your default UPI app
4. Amount should be pre-filled
5. Complete payment in app

### Test Copy Button (Desktop)

1. Click "Copy" button next to UPI ID
2. Paste into any text editor
3. Should see: `your-upi@bankname`

## 💡 Common Issues

| Issue | Solution |
|-------|----------|
| UPI section not showing | Check `.env.local` has `NEXT_PUBLIC_UPI_ID` set |
| Wrong amount displayed | Clear cache, restart `npm run dev` |
| UPI link opens wrong app | Install Google Pay or PhonePe first |
| Copy button not working | Works in HTTPS or localhost ONLY |

## 📋 Fee Reminder

- IEEE Member: **₹399** per person
- Non-IEEE Member: **₹499** per person

**Examples:**
- 2 members (1 IEEE + 1 Non) = ₹399 + ₹499 = **₹898**
- 3 members (all IEEE) = 3 × ₹399 = **₹1,197**
- 4 members (all Non) = 4 × ₹499 = **₹1,996**

## 📱 What Users See

### Desktop Payment Page
```
┌─────────────────────────────────┐
│   💰 PAYMENT DETAILS             │
├─────────────────────────────────┤
│  TOTAL AMOUNT TO PAY             │
│  ₹898                            │
├─────────────────────────────────┤
│  UPI ID                          │
│  [codeforge@okhdfcbank] [Copy]   │
├─────────────────────────────────┤
│  [🔗 Open UPI Payment]           │
├─────────────────────────────────┤
│  After payment, upload           │
│  confirmation screenshot below   │
└─────────────────────────────────┘
```

### Mobile Payment Page
```
Same as above, but:
- UPI link opens native app
- Amount pre-filled
- User completes payment
- Returns to page
- Uploads screenshot
```

## 🔐 Environment Variables Reference

```env
# REQUIRED: Your UPI ID that will receive payments
NEXT_PUBLIC_UPI_ID=your-upi@bankname

# OPTIONAL: Organization name shown in payment
# Defaults to "CodeForge3.0" if not set
NEXT_PUBLIC_UPI_NAME=Your Organization

# OPTIONAL: Razorpay integration (skip if not using)
# NEXT_PUBLIC_RAZORPAY_KEY_ID=key_xyz
# RAZORPAY_SECRET=secret_xyz (never expose!)
```

## 📞 Support

Need help? Check:
1. `PAYMENT_UPI_SETUP.md` - Detailed guide (100+ KB)
2. `.env.example` - Environment variable template
3. Browser console for errors: `F12` → Console tab

## 🎯 Next Steps

1. ✅ Set up `.env.local` with UPI ID
2. ✅ Test on `http://localhost:3000/login`
3. ✅ Verify payment section displays
4. ✅ Test copy button and payment link
5. ✅ Test on mobile device (for UPI link)
6. ✅ Deploy to production with same env vars

That's it! 🚀
