# Ticket Generation System - Quick Start Guide

## ✅ What's Been Implemented

### 1. **Ticket SVG Template** (`src/lib/ticketTemplate.js`)
- Professional Y2K-styled ticket design
- Includes team name, team ID, leader name, member count
- Placeholder for QR code
- CodeForge 3.0 branding
- Decorative elements matching your site theme

### 2. **Automatic Ticket Generation** (`src/app/api/admin/teams/route.js`)
- When you approve a team in admin panel, ticket is automatically generated
- Console logs show ticket details
- Ready for email integration

### 3. **Manual Ticket Sending API** (`src/app/api/admin/send-ticket/route.js`)
- Endpoint to manually send tickets
- Beautiful HTML email template
- SVG ticket attached to email
- Currently simulated (logs to console)

### 4. **Ticket Preview API** (`src/app/api/admin/preview-ticket/route.js`)
- View ticket before sending
- Access at: `/api/admin/preview-ticket?team_id=123`

## 🧪 How to Test

### Test 1: Approve a Team
1. Go to admin panel: `/admin/dashboard`
2. Edit any team
3. Check the "Approved" checkbox
4. Save changes
5. Check your server console - you should see:
   ```
   🎫 Team approved! Ticket generated for: [Team Name]
   📧 Email would be sent to: [Email]
   ✅ Ticket SVG size: [Size] bytes
   ```

### Test 2: Preview a Ticket
1. Open browser to: `http://localhost:3001/api/admin/preview-ticket?team_id=1`
2. You'll see the SVG ticket render in your browser
3. Right-click → Save to download

### Test 3: Manual Ticket Send (via API tool)
Using Postman, Thunder Client, or curl:
```bash
POST http://localhost:3001/api/admin/send-ticket
Content-Type: application/json

{
  "team_id": 1
}
```

Response will include:
- Success message
- Ticket SVG preview
- Email simulation details

## 📧 Email Integration (Next Steps)

### Option 1: Brevo (Recommended - Free)
See `EMAIL_SETUP.md` for complete instructions.

Quick setup:
```bash
npm install @sendinblue/client
```

Add to `.env.local`:
```
BREVO_API_KEY=your_api_key_here
```

### Option 2: Other Services
- **SendGrid**: 100 emails/day free
- **Resend**: 3,000 emails/month free
- **Mailgun**: 5,000 emails/month free

## 🎨 Customize the Ticket

Edit `src/lib/ticketTemplate.js` to:
- Change colors
- Add event date/time
- Add venue details
- Customize fonts
- Add real QR code (use `qrcode` npm package)

Example QR code integration:
```bash
npm install qrcode
```

Then in `ticketTemplate.js`:
```javascript
import QRCode from 'qrcode';

// Generate QR code data URL
const qrCodeUrl = await QRCode.toDataURL(`TEAM-${team_id}`);

// Use in SVG:
<image href="${qrCodeUrl}" x="580" y="160" width="120" height="120"/>
```

## 🔄 Current Flow

1. **Team Registration** → Team created in database (approved: false)
2. **Admin Reviews** → Opens admin panel
3. **Admin Approves** → Checks "Approved" checkbox
4. **Ticket Auto-Generated** → System creates SVG ticket
5. **Email Sent** → (When configured) Email with ticket sent to leader
6. **Team Receives** → Leader gets email with ticket attachment

## 📝 Email Template Features

The email includes:
- ✅ Welcome message with team leader's name
- ✅ Team details summary
- ✅ Event information
- ✅ Ticket preview (embedded SVG)
- ✅ Next steps checklist
- ✅ Attached SVG ticket file
- ✅ Professional HTML design

## 🚀 Production Checklist

Before going live:

1. [ ] Install email service package (`@sendinblue/client`)
2. [ ] Add API key to environment variables
3. [ ] Verify sender email in Brevo
4. [ ] Update sender email in code
5. [ ] Test with your own email
6. [ ] Customize ticket design
7. [ ] Add event date/time to ticket
8. [ ] Optional: Add QR code functionality
9. [ ] Test email deliverability
10. [ ] Set up email templates in Brevo dashboard

## 📊 Console Output Example

When you approve a team:
```
🎫 Team approved! Ticket generated for: Code Warriors
📧 Email would be sent to: leader@example.com
✅ Ticket SVG size: 4521 bytes
```

When email integration is active:
```
✅ Email sent successfully to leader@example.com
📧 Ticket attached: CodeForge3.0-Ticket-123.svg
```

## 🎯 What Happens Now?

1. **Test the ticket preview** - Visit the preview API to see your ticket
2. **Approve a test team** - See the console logs
3. **Choose email service** - Decide between Brevo, SendGrid, etc.
4. **Set up email** - Follow EMAIL_SETUP.md
5. **Customize ticket** - Update SVG design as needed
6. **Go live** - Start approving teams!

## Need Help?

- Ticket not generating? Check server console for errors
- Preview not working? Ensure team_id is correct
- Email setup questions? See EMAIL_SETUP.md
- Want to customize design? Edit ticketTemplate.js
