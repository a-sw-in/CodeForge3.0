# Email Integration with Brevo (Sendinblue)

## Setup Instructions

### 1. Create Brevo Account
1. Go to [Brevo](https://www.brevo.com/) (formerly Sendinblue)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key
1. Log in to your Brevo dashboard
2. Go to **Settings** → **SMTP & API**
3. Click on **API Keys** tab
4. Click **Generate a new API key**
5. Copy the API key

### 3. Add API Key to Environment
Add this to your `.env.local` file:
```
BREVO_API_KEY=your_api_key_here
```

### 4. Install Required Package
```bash
npm install @sendinblue/client
```

### 5. Configure Sender Email
1. In Brevo dashboard, go to **Senders**
2. Add and verify your sender email (e.g., noreply@yourdomain.com)
3. Update the sender email in the API code

## Implementation

The ticket email system is already set up with placeholders. To activate it:

### Update send-ticket/route.js

Uncomment the Brevo integration code in `src/app/api/admin/send-ticket/route.js`:

```javascript
const SibApiV3Sdk = require('@sendinblue/client');

async function sendTicketEmail(teamData, ticketSVG) {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, 
    process.env.BREVO_API_KEY
  );
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
  sendSmtpEmail.to = [{ 
    email: teamData.leader_email, 
    name: teamData.leader_name 
  }];
  
  sendSmtpEmail.sender = { 
    email: 'noreply@codeforge.com', // Update with your verified sender
    name: 'CodeForge 3.0' 
  };
  
  sendSmtpEmail.subject = '🎉 Your CodeForge 3.0 Ticket is Ready!';
  sendSmtpEmail.htmlContent = /* ... your HTML content ... */;
  
  // Attach SVG ticket
  sendSmtpEmail.attachment = [{
    name: \`CodeForge3.0-Ticket-\${teamData.team_id}.svg\`,
    content: Buffer.from(ticketSVG).toString('base64')
  }];
  
  await apiInstance.sendTransacEmail(sendSmtpEmail);
  
  return { success: true, message: 'Email sent successfully' };
}
```

## Features

### Current Implementation
✅ Automatic ticket generation when team is approved
✅ SVG ticket template with team details
✅ Email simulation (logs to console)
✅ HTML email template
✅ Ticket attached as SVG file

### To Activate
1. Install `@sendinblue/client`
2. Add BREVO_API_KEY to environment
3. Uncomment the Brevo code
4. Update sender email with verified address

## Testing

### Test Ticket Generation
Visit the admin panel and approve a team. Check the server console for:
```
🎫 Team approved! Ticket generated for: [Team Name]
📧 Email would be sent to: [Email]
✅ Ticket SVG size: [Size] bytes
```

### Manual Ticket Send
You can also manually trigger ticket sending via the API:
```bash
POST /api/admin/send-ticket
{
  "team_id": 123
}
```

## Alternative Email Services

If you prefer other services:

### SendGrid
```bash
npm install @sendgrid/mail
```

### Resend
```bash
npm install resend
```

### Nodemailer (SMTP)
```bash
npm install nodemailer
```

## Brevo Free Tier Limits
- 300 emails per day
- Unlimited contacts
- Email templates
- SMTP relay
- API access

Perfect for event notifications!
