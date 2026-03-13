import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuthServer';
import { supabase } from '@/lib/supabase';
import { generateTicketPDF } from '@/lib/ticketGenerator';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const SibApiV3Sdk = require('@sendinblue/client');

// Email validation helper
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Check for duplicate @ symbols
  const atCount = (email.match(/@/g) || []).length;
  return emailRegex.test(email) && atCount === 1;
}

async function sendTicketEmail(teamData, ticketPDF, ticketNumber) {
  try {
    // Validate email before attempting to send
    if (!isValidEmail(teamData.leader_email)) {
      throw new Error(`❌ Invalid email address: "${teamData.leader_email}". Please fix this email in the database (check for duplicate @ symbols).`);
    }
    
    // Save PDF to public folder for direct access
    const ticketDir = join(process.cwd(), 'public', 'tickets');
    mkdirSync(ticketDir, { recursive: true });
    const fileName = `${ticketNumber}_${teamData.team_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filePath = join(ticketDir, fileName);
    
    writeFileSync(filePath, ticketPDF);
    console.log(`📄 Ticket saved: ${filePath}`);
    
    // Create download URL (relative to public folder)
    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tickets/${fileName}`;
    console.log(`🔗 Download URL: ${downloadUrl}`);
    
    // Initialize Brevo API
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, 
      process.env.BREVO_API_KEY
    );
    
    
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
            .button {
              display: inline-block;
              background-color: #0055FF;
              color: #ffffff;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 5px;
              margin: 15px 0;
              font-weight: bold;
              font-size: 16px;
            }
            .button:hover {
              background-color: #0044CC;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CodeForge 3.0!</h1>
            </div>
            
            <div class="content">
              <h2>Hi ${teamData.leader_name}! 👋</h2>
              
              <p>Congratulations! Your team <strong>${teamData.team_name}</strong> has been approved for CodeForge 3.0.</p>
              
              <div class="info-box">
                <strong> Team Details:</strong><br>
                Team Name: ${teamData.team_name}<br>
                Team ID: #${teamData.team_id}<br>
                Team Size: ${teamData.total_members} members<br>
                Ticket #: <strong>${ticketNumber}</strong><br>
                Leader: ${teamData.leader_name}
              </div>
              
              <div class="ticket-container">
                <p><strong>Your official entry ticket is ready!</strong></p>
                <a href="${downloadUrl}" class="button">📥 Download Your Ticket (PDF)</a>
              </div>
              
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
    
    // Prepare email (NO ATTACHMENT - just the download link)
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ 
      email: teamData.leader_email, 
      name: teamData.leader_name 
    }];
    sendSmtpEmail.sender = { 
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME || 'CodeForge 3.0' 
    };
    sendSmtpEmail.subject = `🎉 Your CodeForge 3.0 Ticket is Ready! (${ticketNumber})`;
    sendSmtpEmail.htmlContent = htmlContent;
    
    // Send email via Brevo (NO attachment)
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email sent successfully to:', teamData.leader_email);
    console.log('📧 Message ID:', result.messageId);
    
    return { 
      success: true, 
      message: `Email sent to ${teamData.leader_email}`,
      messageId: result.messageId,
      ticketUrl: downloadUrl
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
    
    // Generate ticket PDF from SVG template (with existing or new ticket number)
    const result = await generateTicketPDF(teamData, teamData.ticket_number);
    const  pdfBuffer = result.pdfBuffer;
    const ticketNumber = result.ticketNumber;
    
    // Save ticket number to database if it's new
    if (!teamData.ticket_number) {
      const { error: updateError } = await supabase
        .from('teams')
        .update({ ticket_number: ticketNumber })
        .eq('team_id', team_id);
      
      if (updateError) {
        console.error('Error saving ticket number:', updateError);
        // Continue anyway - ticket can still be sent
      }
    }
    
    // Send email with ticket download link
    const emailResult = await sendTicketEmail(teamData, pdfBuffer, ticketNumber);
    
    return NextResponse.json({
      success: true,
      message: `Ticket sent to ${teamData.leader_email}`,
      ticketGenerated: true,
      ticketNumber: ticketNumber,
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
