import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuthServer';
import { supabase } from '@/lib/supabase';
import { generateTicketPDF } from '@/lib/ticketPDF';
const SibApiV3Sdk = require('@sendinblue/client');

// Email validation helper
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Check for duplicate @ symbols
  const atCount = (email.match(/@/g) || []).length;
  return emailRegex.test(email) && atCount === 1;
}

async function sendTicketEmail(teamData, ticketPDF) {
  try {
    // Validate email before attempting to send
    if (!isValidEmail(teamData.leader_email)) {
      throw new Error(`❌ Invalid email address: "${teamData.leader_email}". Please fix this email in the database (check for duplicate @ symbols).`);
    }
    
    // Initialize Brevo API
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, 
      process.env.BREVO_API_KEY
    );
    
    // Prepare HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #0055FF 0%, #001A6E 100%);
              color: #CCFF00;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 30px;
              color: #333;
            }
            .ticket-container {
              margin: 20px 0;
              text-align: center;
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
            }
            .info-box {
              background-color: #f0f9ff;
              border-left: 4px solid #0055FF;
              padding: 15px;
              margin: 15px 0;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              background-color: #0055FF;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to CodeForge 3.0!</h1>
            </div>
            
            <div class="content">
              <h2>Hi ${teamData.leader_name}! 👋</h2>
              
              <p>Congratulations! Your team <strong>${teamData.team_name}</strong> has been approved for CodeForge 3.0.</p>
              
              <div class="info-box">
                <strong>📋 Team Details:</strong><br>
                Team Name: ${teamData.team_name}<br>
                Team ID: #${teamData.team_id}<br>
                Team Size: ${teamData.total_members} members<br>
                Leader: ${teamData.leader_name}
              </div>
              
              <p>Your official entry ticket is attached to this email as a PDF file.</p>
              <p><strong>📎 Attachment:</strong> CodeForge3.0_Ticket_${teamData.team_name}.pdf</p>
              <ul>
                <li>Download and save the PDF ticket</li>
                <li>Print it or keep it on your phone</li>
                <li>Bring it with you on event day</li>
                <li>Forward this email to your team members</li>
              </ul>
              
              <p style="margin-top: 20px;">
                <strong>What's Next?</strong><br>
                - Check your email for event updates<br>
                - Join our Discord/Slack community (link coming soon)<br>
                - Start preparing your ideas!
              </p>
            </div>
            
            <div class="footer">
              <p>CodeForge 3.0 | IEEE UCEK Branch</p>
              <p>24-Hour Hackathon | Innovation • Code • Create</p>
              <p style="font-size: 10px; margin-top: 10px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Prepare email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ 
      email: teamData.leader_email, 
      name: teamData.leader_name 
    }];
    sendSmtpEmail.sender = { 
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@codeforge3.com',
      name: process.env.BREVO_SENDER_NAME || 'CodeForge 3.0' 
    };
    sendSmtpEmail.subject = '🎉 Your CodeForge 3.0 Ticket is Ready!';
    sendSmtpEmail.htmlContent = htmlContent;
    
    // Attach PDF ticket
    sendSmtpEmail.attachment = [{
      name: `CodeForge3.0_Ticket_${teamData.team_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      content: ticketPDF.toString('base64')
    }];
    
    // Send email via Brevo
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email sent successfully to:', teamData.leader_email);
    console.log('📧 Message ID:', result.messageId);
    
    return { 
      success: true, 
      message: `Email sent to ${teamData.leader_email}`,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    // Verify admin authentication
    const authenticated = await isAdminAuthenticated();
    
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { team_id } = await request.json();
    
    if (!team_id) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch team data
    const { data: teamData, error } = await supabase
      .from('teams')
      .select('*')
      .eq('team_id', team_id)
      .single();
    
    if (error || !teamData) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Check if team is approved
    if (!teamData.approved) {
      return NextResponse.json(
        { error: 'Team must be approved first' },
        { status: 400 }
      );
    }
    
    // Generate ticket PDF
    const ticketPDF = await generateTicketPDF(teamData);
    
    // Send email with ticket
    const emailResult = await sendTicketEmail(teamData, ticketPDF);
    
    return NextResponse.json({
      success: true,
      message: `Ticket sent to ${teamData.leader_email}`,
      ticketGenerated: true,
      emailResult
    });
    
  } catch (error) {
    console.error('Send ticket API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
