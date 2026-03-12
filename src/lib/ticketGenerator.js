// Ticket Generator for CodeForge 3.0
// Reads ticket.svg, injects team data, converts to PDF
import { readFileSync } from 'fs';
import { join } from 'path';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';

// Generate a unique 6-digit alphanumeric ticket number
export function generateTicketNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes similar chars (I, O, 0, 1)
  let ticketNumber = '';
  for (let i = 0; i < 6; i++) {
    ticketNumber += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ticketNumber;
}

// Generate ticket PDF from SVG template
export async function generateTicketPDF(teamData, ticketNumber = null) {
  const { team_name, leader_name, team_id, total_members } = teamData;
  
  try {
    // Read the ticket.svg template
    const svgPath = join(process.cwd(), 'src', 'lib', 'ticket.svg');
    let svgContent = readFileSync(svgPath, 'utf-8');
    
    // Use provided ticket number or generate new one
    const ticketNo = ticketNumber || generateTicketNumber();
    
    // Replace placeholders in SVG (if they exist)
    svgContent = svgContent.replace(/\{\{TEAM_NAME\}\}/g, team_name.toUpperCase());
    svgContent = svgContent.replace(/\{\{TICKET_NO\}\}/g, ticketNo);
    svgContent = svgContent.replace(/\{\{LEADER_NAME\}\}/g, leader_name);
    svgContent = svgContent.replace(/\{\{TEAM_ID\}\}/g, String(team_id).padStart(4, '0'));
    svgContent = svgContent.replace(/\{\{MEMBERS\}\}/g, total_members);
    
    // Convert SVG to PDF using Advanced PDFKit + SVGtoPDF
    const baseWidth = 612;
    const baseHeight = 198;
    
    // Paths to bundled fonts
    const regularFont = join(process.cwd(), 'src', 'lib', 'arial.ttf');
    const boldFont = join(process.cwd(), 'src', 'lib', 'arialbd.ttf');
    
    // Create PDF document
    const doc = new PDFDocument({
      size: [baseWidth, baseHeight],
      margin: 0,
      // Setting a specific font avoids searching for built-in Helvetica AFM files which error out
      font: regularFont 
    });

    // Register fonts for SVGtoPDF to find
    doc.registerFont('Arial', regularFont);
    doc.registerFont('ArialBold', boldFont);
    
    // Collect PDF bytes in a buffer
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Render SVG into PDF
    SVGtoPDF(doc, svgContent, 0, 0, {
      preserveAspectRatio: 'xMidYMid meet',
      width: baseWidth,
      height: baseHeight,
      // Handle bold font requests from SVG
      fontCallback: (family, bold, italic) => {
        if (bold) return boldFont;
        return regularFont;
      }
    });
    
    doc.end();
    
    // Wait for PDF generation to complete
    const pdfBuffer = await new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
    
    return {
      pdfBuffer,
      ticketNumber: ticketNo
    };
    
  } catch (error) {
    console.error('Error generating ticket PDF:', error);
    throw new Error(`Failed to generate ticket: ${error.message}`);
  }
}

// Generate SVG with team data (for preview/debugging)
export function generateTicketSVG(teamData, ticketNumber = null) {
  const { team_name, leader_name, team_id, total_members } = teamData;
  
  try {
    const svgPath = join(process.cwd(), 'src', 'lib', 'ticket.svg');
    let svgContent = readFileSync(svgPath, 'utf-8');
    
    const ticketNo = ticketNumber || generateTicketNumber();
    
    svgContent = svgContent.replace(/\{\{TEAM_NAME\}\}/g, team_name.toUpperCase());
    svgContent = svgContent.replace(/\{\{TICKET_NO\}\}/g, ticketNo);
    svgContent = svgContent.replace(/\{\{LEADER_NAME\}\}/g, leader_name);
    svgContent = svgContent.replace(/\{\{TEAM_ID\}\}/g, String(team_id).padStart(4, '0'));
    svgContent = svgContent.replace(/\{\{MEMBERS\}\}/g, total_members);
    
    return svgContent;
  } catch (error) {
    console.error('Error generating ticket SVG:', error);
    throw error;
  }
}
