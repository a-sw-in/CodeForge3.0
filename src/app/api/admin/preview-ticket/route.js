import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuthServer';
import { supabase } from '@/lib/supabase';
import { generateTicketPDF } from '@/lib/ticketGenerator';

export async function GET(request) {
  try {
    // Verify admin authentication
    const authenticated = await isAdminAuthenticated();
    
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get team_id from query params
    const { searchParams } = new URL(request.url);
    const team_id = searchParams.get('team_id');
    
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
    
    // Generate ticket PDF from SVG (using existing ticket number if available)
    const { pdfBuffer } = await generateTicketPDF(teamData, teamData.ticket_number);
    
    // Return PDF with proper content type
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="CodeForge3.0_Ticket_${teamData.team_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Preview ticket API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
