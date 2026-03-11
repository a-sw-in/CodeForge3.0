# Supabase Storage Setup for Payment Screenshots

**⚠️ IMPORTANT: This setup is REQUIRED before users can register. The registration will fail with "Storage bucket not configured" error if this is not completed.**

This guide explains how to set up Supabase Storage to enable payment screenshot uploads.

## 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `hackathon-files`
   - **Public bucket**: ✅ **Enable** (so uploaded images are publicly accessible)
   - **File size limit**: 5 MB (recommended for screenshots)
   - **Allowed MIME types**: `image/*` (optional, for security)

5. Click **Create bucket**

## 2. Set Storage Policies (Optional but Recommended)

To allow anyone to upload and view files:

### Policy for SELECT (Read)
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'hackathon-files');
```

### Policy for INSERT (Upload)
```sql
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hackathon-files');
```

## 3. Update Database Schema

Add a column to store the payment screenshot URLs (as JSON array) in your `teams` table:

```sql
ALTER TABLE teams
ADD COLUMN payment_screenshot_urls TEXT;
```

Or if using Supabase Table Editor:
1. Go to **Table Editor** > **teams** table
2. Click **+ New Column**
3. Configure:
   - **Name**: `payment_screenshot_urls`
   - **Type**: `text`
   - **Default value**: `NULL`
   - **Is nullable**: ✅ Yes

**Note**: The column stores a JSON array of URLs (e.g., `["url1", "url2", "url3"]`)

## 4. Verification

After setup, verify:
- ✅ Bucket `hackathon-files` exists
- ✅ Bucket is set to **Public**
- ✅ Column `payment_screenshot_urls` exists in `teams` table
- ✅ Registration form shows "Payment Screenshots" upload field (supports multiple files)

## 5. Testing

1. Go to the registration page
2. Fill in all fields
3. Upload multiple payment screenshots (JPG, PNG, etc.)
4. You can add/remove files before submitting
5. Complete registration
6. Check Supabase Storage to see the uploaded files
7. Check the database to see the JSON array of URLs stored in `payment_screenshot_urls`

## File Organization

Uploaded files are stored with this structure:
```
hackathon-files/
  └── payment-screenshots/
      ├── {uuid1}.png
      ├── {uuid2}.jpg
      └── {uuid3}.jpeg
```

Each file gets a unique UUID to prevent naming conflicts.

## Data Storage Format

The `payment_screenshot_urls` column stores URLs as a JSON array:
```json
["https://your-supabase-url.co/storage/v1/object/public/hackathon-files/payment-screenshots/uuid1.png", "https://your-supabase-url.co/storage/v1/object/public/hackathon-files/payment-screenshots/uuid2.jpg"]
```

This allows teams to upload multiple payment proofs, which are all linked to their team record.

## Storage Limits (Free Tier)

- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- More than enough for a hackathon registration system

## Troubleshooting

**Upload fails with "Storage bucket not configured"**
- The bucket `hackathon-files` does not exist
- Go to Supabase Dashboard > Storage > Create the bucket
- Make sure the name is exactly `hackathon-files` (case-sensitive)

**Upload fails with "403 Forbidden" or "policy"**
- Check that the bucket is set to Public
- Verify storage policies are correctly configured

**Upload fails with "Storage bucket not found"**
- Verify bucket name is exactly `hackathon-files`
- Check your Supabase URL and keys in `.env.local`

**Image doesn't display in admin panel**
- Verify the bucket is set to Public
- Check the URL format in the database

**General debugging:**
- Open browser console (F12) to see detailed error messages
- Check Supabase Dashboard > Storage to verify bucket exists
- Try uploading a file manually in Supabase Dashboard to test permissions

## Quick Setup Checklist

Before allowing user registrations:
- [ ] Storage bucket `hackathon-files` created
- [ ] Bucket set to **Public**
- [ ] Storage policies configured (SELECT and INSERT)
- [ ] Column `payment_screenshot_urls` added to `teams` table
- [ ] Test upload from registration form works

