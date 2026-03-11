# Storage Upload Error - Quick Diagnosis

## Current Error: "Failed to upload screenshot"

This error happens because the Supabase Storage bucket is **not configured yet**. Here's how to fix it:

---

## ✅ STEP 1: Create the Storage Bucket

1. Go to: https://wmsutsohaiyeejycsmmt.supabase.co/project/wmsutsohaiyeejycsmmt/storage/buckets
   
2. Click **"New bucket"** button (top right)

3. Fill in:
   - **Name**: `hackathon-files` (EXACTLY this name)
   - **Public bucket**: ✅ **TURN THIS ON** (very important!)
   - Click **"Create bucket"**

---

## ✅ STEP 2: Set Storage Policies (Allow Public Upload)

After creating the bucket, you need to allow uploads:

1. Click on the `hackathon-files` bucket you just created

2. Go to **"Policies"** tab

3. Click **"New Policy"**

4. Select **"For full customization"**

5. **Policy 1 - Allow Public INSERT (Upload)**
   - Policy name: `Public Upload`
   - SELECT allowed operations: ✅ **INSERT**
   - Target roles: `public`
   - Policy definition (use SQL editor):
   ```sql
   bucket_id = 'hackathon-files'
   ```
   - Click **"Review"** then **"Save policy"**

6. Click **"New Policy"** again

7. **Policy 2 - Allow Public SELECT (Read)**
   - Policy name: `Public Access`
   - SELECT allowed operations: ✅ **SELECT**
   - Target roles: `public`
   - Policy definition:
   ```sql
   bucket_id = 'hackathon-files'
   ```
   - Click **"Review"** then **"Save policy"**

---

## ✅ STEP 3: Add Database Column

1. Go to: https://wmsutsohaiyeejycsmmt.supabase.co/project/wmsutsohaiyeejycsmmt/editor

2. Find the `teams` table

3. Click the **`+`** button to add a new column

4. Fill in:
   - **Name**: `payment_screenshot_urls`
   - **Type**: `text`
   - **Default value**: (leave empty)
   - **Is nullable**: ✅ Yes
   - Click **"Save"**

---

## ✅ STEP 4: Test the Upload

1. Go back to your registration page
2. Try uploading a screenshot again
3. Open browser console (F12) to see detailed error messages

---

## 🔍 Still Having Issues?

**Check browser console (F12):**
- Press F12 in your browser
- Go to "Console" tab
- Try registration again
- Look for error messages starting with "Upload error details:"
- Share the exact error message

**Common issues:**
- ❌ Bucket name is wrong → Must be exactly `hackathon-files`
- ❌ Bucket is not public → Toggle "Public bucket" to ON
- ❌ No policies → Follow STEP 2 above
- ❌ Wrong Supabase URL/Key → Check `.env.local` file

---

## Quick Verification Checklist

After setup, verify:
- [ ] Go to Storage → `hackathon-files` bucket exists
- [ ] Bucket shows "Public" badge
- [ ] Policies tab shows 2 policies (INSERT and SELECT)
- [ ] Table Editor → `teams` table has `payment_screenshot_urls` column
- [ ] Browser console (F12) shows no errors during upload

---

## Need Visual Guide?

Screenshots of the setup process:

**1. Creating bucket:**
- Look for "New bucket" button in Storage section
- Name MUST be `hackathon-files`
- Public bucket toggle MUST be ON

**2. Bucket policies:**
- You should see "INSERT" and "SELECT" policies listed
- Both should have "public" as the target role

**3. Test upload:**
- Upload a small image (JPG/PNG)
- Check browser console for success message: "Screenshot 1 uploaded successfully"
