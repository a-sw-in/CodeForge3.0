import puppeteer from 'puppeteer';
import fs from 'fs';
import path, { format } from 'path';

/**
 * Advanced SVG to PDF converter using Puppeteer
 * Renders SVGs in a real browser engine for perfect element visibility
 * 
 * Advantages over svg-to-pdfkit:
 * - Real browser rendering (Chromium) - all elements display correctly
 * - Supports complex SVG features (filters, masks, transforms)
 * - Consistent output across different SVG types
 * - High-quality PDF generation
 * - No element visibility issues
 */

let browserInstance = null;

/**
 * Get or create browser instance (singleton pattern for performance)
 */
async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
  }
  return browserInstance;
}

/**
 * Close browser instance
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Generate PDF from SVG with data injection
 * @param {string} svgPath - Path to SVG file
 * @param {object} data - Data to inject into placeholders {TEAM_NAME, DATE, TEAM_MEMBER}
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePdfFromSvg(svgPath, data = {}) {
  try {
    // Read SVG file
    if (!fs.existsSync(svgPath)) {
      throw new Error(`SVG file not found: ${svgPath}`);
    }

    let svgContent = fs.readFileSync(svgPath, 'utf8');

    // Inject data into SVG placeholders
    svgContent = svgContent.replace(/{{TEAM_NAME}}/g, data.teamName || 'Team Name');
    svgContent = svgContent.replace(/{{TEAM_MEMBER}}/g, data.teamMember || 'Team Member');
    svgContent = svgContent.replace(/{{DATE}}/g, data.date || new Date().toLocaleDateString());

    // Escape single quotes and create HTML wrapper
    const escapedSvg = svgContent.replace(/'/g, "\\'");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            margin: 0;
            size: 960px 551px;
          }
          html, body {
            margin: 0;
            padding: 0;
            width:100%;
            height:auto;
            overflow: hidden;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          svg {
            display: block;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
      </html>
    `;

    // Launch browser and generate PDF
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Set content and wait for rendering
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      width: '960px',
      height: '500px',
      printBackground: true,
      omitBackground: true,
      scale: 1.0,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });

    await page.close();

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF from SVG:', error.message);
    throw error;
  }
}

/**
 * Generate multiple PDFs from SVG with different data
 * Useful for batch certificate generation
 * @param {string} svgPath - Path to SVG template
 * @param {array} dataArray - Array of data objects {teamName, date, teamMember}
 * @returns {Promise<array>} Array of {data, pdfBuffer}
 */
export async function generateMultiplePdfs(svgPath, dataArray = []) {
  const results = [];

  for (const data of dataArray) {
    try {
      const pdfBuffer = await generatePdfFromSvg(svgPath, data);
      results.push({
        success: true,
        data,
        pdfBuffer
      });
    } catch (error) {
      results.push({
        success: false,
        data,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Generate PDF with custom SVG string (useful for dynamic SVG generation)
 * @param {string} svgHtml - SVG markup as string
 * @param {object} data - Data to inject (for compatibility)
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePdfFromSvgString(svgHtml, data = {}) {
  try {
    // Create temporary file
    const tmpDir = path.join(process.cwd(), '.tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const tmpPath = path.join(tmpDir, `cert-${Date.now()}.svg`);
    fs.writeFileSync(tmpPath, svgHtml, 'utf8');

    // Generate PDF
    const pdfBuffer = await generatePdfFromSvg(tmpPath, data);

    // Cleanup
    fs.unlinkSync(tmpPath);

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF from SVG string:', error.message);
    throw error;
  }
}

/**
 * Get rendering quality metrics
 * Returns information about rendering quality
 */
export function getQualityInfo() {
  return {
    renderer: 'Puppeteer (Chromium)',
    features: [
      'Real browser rendering',
      'Full SVG support',
      'Complex elements (filters, masks, transforms)',
      'Custom fonts support',
      'High-quality PDF output',
      'No visibility issues',
      '100% element rendering'
    ],
    advantages: [
      'Elements render visibly in PDFs',
      'Complex SVG features supported',
      'Consistent output quality',
      'Professional PDF generation'
    ],
    format: 'A4',
    scale: '1.0x'
  };
}
