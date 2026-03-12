import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuthServer';
import { supabase } from '@/lib/supabase';
import { generateTicketPDF } from '@/lib/ticketGenerator';
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
    
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, 
      process.env.BREVO_API_KEY
    );
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
          <p>Hi ${teamData.leader_name},</p>
          
          <p>Your team ${teamData.team_name} has been approved for CodeForge 3.0, the 24-hour hackathon by IEEE UCEK Branch.</p>
          
          <p>
            <strong>Team Details</strong><br>
            Team ID: #${teamData.team_id}<br>
            Team Size: ${teamData.total_members} members<br>
            Leader: ${teamData.leader_name}
          </p>
          
          <p>Your entry ticket is attached as a PDF.</p>
          
          <p>Further updates will be shared soon.</p>
          
          <p>
            Regards,<br>
            Team CodeForge 3.0<br>
            IEEE UCEK Branch
          </p>
        </body>
      </html>
    `;
    
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
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email sent successfully to:', teamData.leader_email);
    console.log('📧 Message ID:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // Verify admin authentication
    const authenticated = await isAdminAuthenticated();
    
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch teams data from Supabase
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching teams:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      );
    }
    
    // Calculate statistics
    const totalTeams = teams.length;
    const totalMembers = teams.reduce((sum, team) => {
      // Count members based on your database schema
      // Adjust this based on your actual schema
      return sum + (team.total_members || 0);
    }, 0);
    
    return NextResponse.json({
      success: true,
      teams,
      statistics: {
        totalTeams,
        totalMembers
      }
    });
    
  } catch (error) {
    console.error('Teams API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function PUT(request) {
  try {
    // Verify admin authentication
    const authenticated = await isAdminAuthenticated();
    
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const teamData = await request.json();
    
    if (!teamData.team_id) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }
    
    // Check current approval status before update
    const { data: currentTeam, error: fetchError } = await supabase
      .from('teams')
      .select('approved')
      .eq('team_id', teamData.team_id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current team:', fetchError);
    }
    
    const wasApproved = currentTeam?.approved;
    const isNowApproved = Boolean(teamData.approved);
    const isNewlyApproved = !wasApproved && isNowApproved;
    
    // Prepare update data - only include editable fields
    const updateData = {
      team_name: teamData.team_name,
      total_members: teamData.total_members,
      approved: Boolean(teamData.approved),
      leader_name: teamData.leader_name,
      leader_email: teamData.leader_email,
      leader_year: teamData.leader_year,
      member2_name: teamData.member2_name || null,
      member2_email: teamData.member2_email || null,
      member2_year: teamData.member2_year || null,
      member3_name: teamData.member3_name || null,
      member3_email: teamData.member3_email || null,
      member3_year: teamData.member3_year || null,
      member4_name: teamData.member4_name || null,
      member4_email: teamData.member4_email || null,
      member4_year: teamData.member4_year || null,
    };
    
    // Update team in Supabase
    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('team_id', teamData.team_id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating team:', error);
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 500 }
      );
    }
    
    // If team is newly approved, send ticket email
    if (isNewlyApproved) {
      try {
        const { pdfBuffer, ticketNumber } = await generateTicketPDF(data);
        
        console.log('🎫 Team approved! Generating PDF ticket from SVG for:', data.team_name, 'Ticket:', ticketNumber);
        
        // Save ticket number to database
        const { error: updateTicketError } = await supabase
          .from('teams')
          .update({ ticket_number: ticketNumber })
          .eq('team_id', data.team_id);
          
        if (updateTicketError) {
          console.error('❌ Error saving ticket number to DB:', updateTicketError);
        } else {
          console.log('✅ Ticket number saved to database:', ticketNumber);
          // Update the local data object to reflect the new ticket number
          data.ticket_number = ticketNumber;
        }

        // Send email with ticket
        await sendTicketEmail(data, pdfBuffer);
        
        console.log('✅ Ticket email sent successfully to:', data.leader_email);
        
      } catch (ticketError) {
        console.error('❌ Error generating/sending ticket:', ticketError);
        // Don't fail the update if ticket generation fails
      }
    }
    
    return NextResponse.json({
      success: true,
      team: data,
      ticketSent: isNewlyApproved
    });
    
  } catch (error) {
    console.error('Update team API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}