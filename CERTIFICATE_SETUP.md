# Certificate System Setup Guide

## Overview
The certificate system generates and emails certificates in 4 categories. Each has a unique color design. Administrators can send any category certificate to teams from the team details modal.

**Uses the same email service as tickets - Brevo (formerly Sendinblue)**

## File Structure

### SVG Templates
- `src/lib/certificate1.svg` - Category I (Gold)
- `src/lib/certificate2.svg` - Category II (Silver)
- `src/lib/certificate3.svg` - Category III (Bronze)
- `src/lib/certificate4.svg` - Category IV (Participation - Blue)

**Note:** You can replace these SVG files with your custom designs. Keep the placeholders:
  - `{{TEAM_NAME}}` - Will be replaced with team name
  - `{{DATE}}` - Will be replaced with current date

### Backend Files
- `src/lib/certificateGenerator.js` - Certificate generation logic
- `src/app/api/admin/certificates/route.js` - API endpoint (uses Brevo)

### Frontend
- `src/app/admin/dashboard/DashboardContent.js` - 4 certificate buttons in team details modal

## Setup Instructions

### 1. Configure Email Service (Brevo)

The certificate system uses **Brevo** for email sending, the same as the ticket system.

Make sure you have these in `.env.local`:

```env
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=your-sender-email@example.com
BREVO_SENDER_NAME=CodeForge 3.0
```

**To get Brevo API Key:**
1. Go to [Brevo Dashboard](https://app.brevo.com)
2. Navigate to Settings > SMTP & API
3. Copy your API Key (REST API v3)
4. Add it to `.env.local`

**Sender Email Configuration:**
- Verify your sender email in Brevo
- Use the same configuration as your ticket system

### 2. No Additional Dependencies Required

Brevo dependencies are already installed (used for ticket system).

### 3. Database Setup (Optional - for logging)

Create a `certificate_logs` table in Supabase:

```sql
CREATE TABLE certificate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(team_id),
  category_id INT NOT NULL,
  category_name VARCHAR(50),
  sent_to TEXT[] NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  sent_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## How It Works

### Admin Flow

1. **Open Team Details**
   - Click on any team in the Dashboard table
   - Team details modal opens

2. **Send Certificate**
   - Scroll to bottom of modal
   - Click one of 4 category buttons:
     - 🥇 Category 1 (Gold)
     - 🥈 Category 2 (Silver)
     - 🥉 Category 3 (Bronze)
     - ✨ Category 4 (Participation)

3. **Certificate Generated & Sent**
   - Certificate PDF is generated from the SVG template
   - Team data (name, date) is injected into the certificate
   - Email is sent to:
     - Team leader
     - All team members (if emails exist)
   - Success message appears in modal
   - Certificate log entry is created (if table exists)

### Email Recipients

The certificate is sent to all valid email addresses:
- Leader email
- Member 2 email (if exists)
- Member 3 email (if exists)
- Member 4 email (if exists)

Duplicates are automatically removed.

## Customizing Certificates

### Update SVG Templates

Replace the SVG files in `src/lib/` with your custom designs while keeping:
- Same file names (certificate1.svg - certificate4.svg)
- Placeholder tags: `{{TEAM_NAME}}` and `{{DATE}}`
- Viewbox dimensions: 800x600 (recommended)

### Change Email Template

Edit the HTML email in `src/app/api/admin/certificates/route.js`:

```javascript
const htmlContent = `
  <!DOCTYPE html>
  <html>
    <body style="font-family: Arial, sans-serif;">
      <!-- Your custom email HTML -->
    </body>
  </html>
`;
```

The Brevo API automatically sends to all recipients in the `to` array.

### Modify Recipient List

Edit `src/app/api/admin/certificates/route.js` around line 60-70 to add/remove who receives certificates:

```javascript
const recipients = [teamData.leader_email]; // Add/remove recipients here
if (teamData.member2_email) recipients.push(teamData.member2_email);
// ... etc
```

### Change Sender Configuration

Update `BREVO_SENDER_EMAIL` and `BREVO_SENDER_NAME` in `.env.local`:

```env
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Your Organization
```

## API Endpoint

**POST** `/api/admin/certificates`

**Request Body:**
```json
{
  "teamId": "uuid-here",
  "categoryId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category I certificate sent successfully to 3 recipient(s)",
  "recipients": ["email1@example.com", "email2@example.com"],
  "fileName": "Certificate_Category I_TeamName_1712248800000.pdf"
}
```

## Troubleshooting

### Certificates Not Sending

1. Check `.env.local` has `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME`
2. Verify Brevo API Key is valid (from REST API v3 in Brevo dashboard)
3. Verify sender email is confirmed in Brevo
4. Check email addresses in team data are valid (no duplicate @ symbols)
5. Review browser console and server logs for error messages

### Invalid Email Error

If you see "Invalid email address" error:
1. Check the team's email fields in the database
2. Look for duplicate @ symbols or extra spaces
3. Verify email format is correct (name@domain.com)
4. Use database to fix invalid emails

### Certificate Generation Fails

1. Verify font files exist: `src/lib/arial.ttf` and `src/lib/arialbd.ttf`
2. Check SVG file format is valid (well-formed XML)
3. Ensure `{{TEAM_NAME}}` placeholder exists in SVG
4. Verify certificate SVG files are in `src/lib/` directory

### Styling Issues

1. SVGs render as-is; ensure your design has proper colors
2. Font sizes must be readable at 800x600px
3. Test with different team name lengths
4. Check color hex values in SVG are correct

### Email Templates Not Updating

1. Changes to HTML in route.js are reflected immediately
2. Clear browser cache if old emails still show
3. Check email logs in Brevo dashboard

## Common Issues

**"Unauthorized" Error:**
- Verify admin authentication is working
- Check admin token in localStorage

**"Team not found" Error:**
- Verify teamId is correct UUID format
- Check team exists in Supabase

**"No valid email addresses" Error:**
- Ensure leader_email exists and is valid
- Check at least one team member has a valid email

## Future Enhancements

- [ ] Download certificate as ZIP for multiple teams
- [ ] Bulk send certificates to all teams
- [ ] Certificate template editor in admin panel
- [ ] Custom recipient list per team
- [ ] Certificate verification/QR codes
- [ ] Certificate tracking dashboard

## Support

For issues or questions:
1. Check browser console for errors
2. Review server logs
3. Verify all `.env.local` variables are set
4. Ensure SVG templates are valid XML
