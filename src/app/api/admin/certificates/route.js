// API endpoint for generating and emailing certificates
import { generateCertificatePDF } from '@/lib/certificateGenerator';
import { supabase } from '@/lib/supabase';
const SibApiV3Sdk = require('@sendinblue/client');

// Email validation helper
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const atCount = (email.match(/@/g) || []).length;
  return emailRegex.test(email) && atCount === 1;
}

export async function POST(req) {
  try {
    const { teamId, categoryId } = await req.json();

    if (!teamId || !categoryId) {
      return Response.json(
        { success: false, error: 'Missing required fields: teamId, categoryId' },
        { status: 400 }
      );
    }

    if (categoryId < 1 || categoryId > 4) {
      return Response.json(
        { success: false, error: 'Invalid category ID. Must be 1-4' },
        { status: 400 }
      );
    }

    // Fetch team data from database
    const { data: teamData, error: fetchError } = await supabase
      .from('teams')
      .select('*')
      .eq('team_id', teamId)
      .single();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return Response.json(
        { success: false, error: `Database error: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!teamData) {
      console.error(`Team not found with ID: ${teamId}`);
      return Response.json(
        { success: false, error: 'Team not found in database' },
        { status: 404 }
      );
    }

    // Create member list with names and emails for personalized certificates
    const members = [];
    
    if (teamData.leader_email && isValidEmail(teamData.leader_email)) {
      members.push({
        email: teamData.leader_email,
        name: teamData.leader_name || 'Team Leader'
      });
    }
    
    if (teamData.member2_email && isValidEmail(teamData.member2_email)) {
      members.push({
        email: teamData.member2_email,
        name: teamData.member2_name || 'Team Member 2'
      });
    }
    
    if (teamData.member3_email && isValidEmail(teamData.member3_email)) {
      members.push({
        email: teamData.member3_email,
        name: teamData.member3_name || 'Team Member 3'
      });
    }
    
    if (teamData.member4_email && isValidEmail(teamData.member4_email)) {
      members.push({
        email: teamData.member4_email,
        name: teamData.member4_name || 'Team Member 4'
      });
    }

    if (members.length === 0) {
      return Response.json(
        { success: false, error: 'No valid team members with email addresses found' },
        { status: 400 }
      );
    }

    // Send email using Brevo
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sentTo = [];
    let categoryName = 'Certificate'; // We'll get this from the first generation

    // Generate and send personalized certificate to each member
    for (const member of members) {
      try {
        // Create personalized certificate data for this member
        const memberCertificateData = {
          ...teamData,
          team_member: member.name
        };

        // Generate personalized certificate PDF
        const { pdfBuffer, categoryName: resultCategoryName } = await generateCertificatePDF(
          memberCertificateData,
          categoryId
        );
        
        categoryName = resultCategoryName || categoryName;
        
        // Defensive check to correctly handle the pdfBuffer format
        let actualBuffer;
        if (Buffer.isBuffer(pdfBuffer)) {
          actualBuffer = pdfBuffer;
        } else if (pdfBuffer && pdfBuffer.type === 'Buffer' && Array.isArray(pdfBuffer.data)) {
          // It was somehow JSON serialized
          actualBuffer = Buffer.from(pdfBuffer.data);
        } else if (pdfBuffer instanceof Uint8Array || pdfBuffer instanceof ArrayBuffer) {
          actualBuffer = Buffer.from(pdfBuffer);
        } else if (typeof pdfBuffer === 'object') {
           // As a last-resort fallback if it's a plain object acting like a byte map
          actualBuffer = Buffer.from(Object.values(pdfBuffer));
        } else {
          actualBuffer = Buffer.from(pdfBuffer);
        }

        const base64Content = actualBuffer.toString('base64');
        const fileName = `${categoryName} Certificate - ${teamData.team_name} - ${member.name}.pdf`;

        // Create personalized email for this member
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #001A6E; margin: 0;">🎓 Congratulations! 🎉</h2>
              </div>
              
              <p>Dear <strong>${member.name}</strong>,</p>
              
              <p>We are delighted to present you with a <strong>${categoryName}</strong> certificate for your exceptional participation and contribution in <strong>CodeForge 3.0</strong> – the 24-hour hackathon by IEEE UCEK Branch.</p>
              
              <div style="background-color: #CCFF00; color: #001A6E; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-weight: bold;">
                Your personalized certificate is attached to this email. Please keep it for your records.
              </div>
              
              <p><strong>Team Details:</strong><br>
              Team Name: ${teamData.team_name}<br>
              Total Members: ${teamData.total_members}</p>
              
              <p>Thank you for your dedication and participation in CodeForge 3.0!</p>
              
              <p style="color: #64748B; font-size: 12px; margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 15px;">
                Best regards,<br/>
                <strong>CodeForge 3.0 Team</strong><br/>
                IEEE UCEK Branch
              </p>
            </body>
          </html>
        `;

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.to = [{ 
          email: member.email, 
          name: member.name 
        }];
        
        sendSmtpEmail.sender = {
          email: process.env.BREVO_SENDER_EMAIL,
          name: process.env.BREVO_SENDER_NAME || 'CodeForge 3.0'
        };
        
        sendSmtpEmail.subject = `🎓 ${categoryName} Certificate - CodeForge 3.0 ${teamData.team_name}`;
        sendSmtpEmail.htmlContent = htmlContent;
        
        // Attach personalized PDF certificate
        sendSmtpEmail.attachment = [{
          name: fileName,
          content: base64Content
        }];

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Certificate sent to ${member.name} (${member.email}) - Message ID: ${result.messageId}`);
        sentTo.push({ email: member.email, name: member.name });
      } catch (memberError) {
        console.error(`❌ Failed to send certificate to ${member.name}:`, memberError);
      }
    }

    // Log certificate sent in database (optional)
    try {
      await supabase
        .from('certificate_logs')
        .insert({
          team_id: teamId,
          category_id: categoryId,
          category_name: 'Certificate',
          sent_to: sentTo.map(m => m.email),
          recipients_count: sentTo.length,
          sent_at: new Date().toISOString(),
          sent_by: 'admin'
        });
      console.log('✅ Certificate log recorded');
    } catch (logError) {
      // Table might not exist yet, that's okay
      console.log('Certificate log table not found, skipping log entry');
    }

    return Response.json({
      success: true,
      message: `Personalized certificates sent successfully to ${sentTo.length} team member(s)`,
      recipients: sentTo,
      totalMembers: members.length,
      successCount: sentTo.length
    });

  } catch (error) {
    console.error('Certificate generation/send error:', error);
    return Response.json(
      { 
        success: false, 
        error: `Failed to generate/send certificate: ${error.message}` 
      },
      { status: 500 }
    );
  }
}
