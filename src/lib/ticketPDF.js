import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateTicketPDF(teamData) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page with custom dimensions (600x300 points)
    const page = pdfDoc.addPage([600, 300]);
    
    // Embed fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Define colors
    const blue = rgb(0, 0.33, 1); // #0055FF
    const yellow = rgb(0.8, 1, 0); // #CCFF00
    const navy = rgb(0, 0.1, 0.43); // #001A6E
    const white = rgb(1, 1, 1);
    const pink = rgb(1, 0.27, 0.67); // #FF44AA
    const gray = rgb(0.39, 0.45, 0.55); // #64748B
    
    // Background (full page blue)
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 600,
      height: 300,
      color: blue,
    });
    
    // Header section (yellow background)
    page.drawRectangle({
      x: 20,
      y: 220, // PDF coordinates are bottom-up
      width: 560,
      height: 60,
      color: yellow,
    });
    
    // Title
    page.drawText('CODEFORGE 3.0', {
      x: 300 - (boldFont.widthOfTextAtSize('CODEFORGE 3.0', 24) / 2),
      y: 250,
      size: 24,
      font: boldFont,
      color: navy,
    });
    
    page.drawText('OFFICIAL ENTRY TICKET', {
      x: 300 - (regularFont.widthOfTextAtSize('OFFICIAL ENTRY TICKET', 10) / 2),
      y: 228,
      size: 10,
      font: regularFont,
      color: navy,
    });
    
    // White content box
    page.drawRectangle({
      x: 20,
      y: 20,
      width: 560,
      height: 190,
      color: white,
    });
    
    // Team details
    const teamName = `TEAM: ${teamData.team_name.toUpperCase()}`;
    page.drawText(teamName, {
      x: 40,
      y: 180,
      size: 16,
      font: boldFont,
      color: navy,
    });
    
    page.drawText(`Team ID: #${teamData.team_id}`, {
      x: 40,
      y: 150,
      size: 10,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    page.drawText(`Leader: ${teamData.leader_name}`, {
      x: 40,
      y: 130,
      size: 10,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    page.drawText(`Team Size: ${teamData.total_members} members`, {
      x: 40,
      y: 110,
      size: 10,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Footer
    page.drawText('IEEE UCEK BRANCH | 24-HOUR HACKATHON', {
      x: 40,
      y: 40,
      size: 8,
      font: regularFont,
      color: gray,
    });
    
    const ticketId = `TICKET-${teamData.team_id}`;
    page.drawText(ticketId, {
      x: 560 - regularFont.widthOfTextAtSize(ticketId, 8),
      y: 40,
      size: 8,
      font: regularFont,
      color: gray,
    });
    
    // Decorative corner circles
    const cornerRadius = 3;
    page.drawCircle({ x: 30, y: 270, size: cornerRadius, color: pink });
    page.drawCircle({ x: 570, y: 270, size: cornerRadius, color: pink });
    page.drawCircle({ x: 30, y: 30, size: cornerRadius, color: pink });
    page.drawCircle({ x: 570, y: 30, size: cornerRadius, color: pink });
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Error generating PDF ticket:', error);
    throw error;
  }
}
