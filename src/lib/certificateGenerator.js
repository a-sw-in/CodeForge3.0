// Certificate Generator for CodeForge 3.0
// Uses advanced Puppeteer-based PDF generation for perfect SVG rendering
import { readFileSync } from 'fs';
import { join } from 'path';
import { generatePdfFromSvg } from './advancedPdfGenerator.js';

const CERTIFICATE_CATEGORIES = {
  1: {
    name: 'Category I',
    svgFile: 'certificate1.svg',
    description: 'Gold Certificate'
  },
  2: {
    name: 'Category II',
    svgFile: 'certificate2.svg',
    description: 'Silver Certificate'
  },
  3: {
    name: 'Category III',
    svgFile: 'certificate3.svg',
    description: 'Bronze Certificate'
  },
  4: {
    name: 'Category IV',
    svgFile: 'certificate4.svg',
    description: 'Participation Certificate'
  }
};

// Generate certificate PDF from SVG template using advanced Puppeteer renderer
export async function generateCertificatePDF(teamData, categoryId = 1) {
  const { team_name, team_member } = teamData;
  
  try {
    // Validate category
    if (!CERTIFICATE_CATEGORIES[categoryId]) {
      throw new Error(`Invalid certificate category: ${categoryId}`);
    }

    const category = CERTIFICATE_CATEGORIES[categoryId];
    
    // Get current date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Path to certificate SVG template
    const svgPath = join(process.cwd(), 'src', 'lib', category.svgFile);
    
    // Data for placeholder injection
    const data = {
      teamName: team_name.toUpperCase(),
      teamMember: team_member || 'Certificate Recipient',
      date: dateStr
    };
    
    // Generate PDF using advanced Puppeteer-based renderer
    const pdfBuffer = await generatePdfFromSvg(svgPath, data);
    
    return {
      pdfBuffer,
      categoryId,
      categoryName: category.name,
      description: category.description,
      fileName: `Certificate_${category.name}_${team_name}_${Date.now()}.pdf`
    };
    
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw new Error(`Failed to generate certificate: ${error.message}`);
  }
}

// Generate SVG with team data (for preview/debugging)
export function generateCertificateSVG(teamData, categoryId = 1) {
  const { team_name, team_member } = teamData;
  
  try {
    if (!CERTIFICATE_CATEGORIES[categoryId]) {
      throw new Error(`Invalid certificate category: ${categoryId}`);
    }

    const category = CERTIFICATE_CATEGORIES[categoryId];
    const svgPath = join(process.cwd(), 'src', 'lib', category.svgFile);
    let svgContent = readFileSync(svgPath, 'utf-8');
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    svgContent = svgContent.replace(/\{\{TEAM_NAME\}\}/g, team_name.toUpperCase());
    svgContent = svgContent.replace(/\{\{DATE\}\}/g, dateStr);
    svgContent = svgContent.replace(/\{\{TEAM_MEMBER\}\}/g, team_member || '');
    
    return svgContent;
  } catch (error) {
    console.error('Error generating certificate SVG:', error);
    throw new Error(`Failed to generate certificate SVG: ${error.message}`);
  }
}

// Get certificate categories info
export function getCertificateCategories() {
  return CERTIFICATE_CATEGORIES;
}
