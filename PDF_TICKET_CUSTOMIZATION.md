# PDF Ticket Customization Guide

## ✅ What's Working Now

Your email system now generates **PDF tickets** using **pdf-lib** (Next.js compatible). PDF files are:
- ✅ Supported by Brevo as email attachments
- ✅ Work in serverless environments (no file system dependencies)
- ✅ Easy to download and print
- ✅ Compatible with all email clients
- ✅ Professional and shareable

---

## 📄 Current Ticket Design

**Location:** `src/lib/ticketPDF.js`

### Current Features:
- **Size:** 600x300 points (landscape)
- **Library:** pdf-lib (serverless-friendly)
- **Colors:** 
  - Background: `rgb(0, 0.33, 1)` → #0055FF (Blue)
  - Header: `rgb(0.8, 1, 0)` → #CCFF00 (Yellow)
  - Text: `rgb(0, 0.1, 0.43)` → #001A6E (Navy)
- **Content:**
  - Team name, ID, leader name
  - Team size
  - Event branding

---

## 🎨 How to Customize

### 1. **Change Colors**
pdf-lib uses `rgb()` values (0-1 range):
```javascript
// Example colors
const blue = rgb(0, 0.33, 1);      // #0055FF
const yellow = rgb(0.8, 1, 0);     // #CCFF00
const navy = rgb(0, 0.1, 0.43);    // #001A6E

// To convert hex to rgb:
// #FF5733 = rgb(1, 0.34, 0.2)
//   FF=255/255=1, 57=87/255=0.34, 33=51/255=0.2
```

### 2. **Change Ticket Size**
```javascript
const page = pdfDoc.addPage([800, 400]); // [width, height] in points
```

### 3. **Change Fonts**
pdf-lib includes standard fonts:
```javascript
import { StandardFonts } from 'pdf-lib';

const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
```

### 4. **Add Custom Images**
```javascript
// PNG image
const pngImageBytes = await fetch('path/to/logo.png').then(res => res.arrayBuffer());
const pngImage = await pdfDoc.embedPng(pngImageBytes);

page.drawImage(pngImage, {
  x: 50,
  y: 200,
  width: 100,
  height: 100,
});

// JPG image
const jpgImageBytes = await fetch('path/to/photo.jpg').then(res => res.arrayBuffer());
const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
```

### 5. **Add QR Code**
First install QR code library:
```bash
npm install qrcode
```

Then in `ticketPDF.js`:
```javascript
import QRCode from 'qrcode';

// Generate QR code
const qrCodeDataURL = await QRCode.toDataURL(`TICKET-${teamData.team_id}`);
const qrImageBytes = await fetch(qrCodeDataURL).then(res => res.arrayBuffer());
const qrImage = await pdfDoc.embedPng(qrImageBytes);

page.drawImage(qrImage, {
  x: 450,
  y: 100,
  width: 100,
  height: 100,
});
```

### 6. **Add Shapes**
```javascript
// Rectangle
page.drawRectangle({
  x: 50,
  y: 100,
  width: 200,
  height: 100,
  color: rgb(1, 0, 0), // red
  borderColor: rgb(0, 0, 0), // black border
  borderWidth: 2,
});

// Circle
page.drawCircle({
  x: 100,
  y: 100,
  size: 50, // radius
  color: rgb(0, 1, 0), // green
});

// Line
page.drawLine({
  start: { x: 0, y: 0 },
  end: { x: 600, y: 300 },
  thickness: 2,
  color: rgb(0, 0, 0),
});
```

---

## 📐 Layout Tips

### Coordinate System:
- **Origin (0,0) is BOTTOM-LEFT corner** (not top-left!)
- X increases going right
- Y increases going UP

### Example Layout for 300pt height:
```javascript
// Header at top: y = 220-280
page.drawRectangle({ x: 20, y: 220, width: 560, height: 60 });

// Content area: y = 20-210  
page.drawRectangle({ x: 20, y: 20, width: 560, height: 190 });

// Footer at bottom: y = 30-50
page.drawText('Footer text', { x: 40, y: 40 });
```

---

## 🔧 Sender Email Setup

**Current sender:** `codeforge.ieee@gmail.com`

### To Verify Sender in Brevo:
1. Go to [Brevo Dashboard](https://app.brevo.com)
2. Navigate to **Senders & IP**
3. Click **Add a Sender**
4. Add `codeforge.ieee@gmail.com`
5. Verify via email confirmation link

---

## 📧 Testing

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to admin panel:**
   ```
   http://localhost:3001/admin/dashboard
   ```

3. **Approve a team**

4. **Check the team leader's email:**
   - Professional HTML email
   - PDF attachment: `CodeForge3.0_Ticket_TeamName.pdf`
   - Download and view the PDF!

---

## 📚 Resources

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [pdf-lib Examples](https://pdf-lib.js.org/docs/api/)
- [Brevo API Docs](https://developers.brevo.com/)

---

## 🐛 Troubleshooting

### Email not sending?
- Check console for error messages
- Verify sender email is approved in Brevo
- Check Brevo API key in `.env.local`

### PDF looks wrong?
- Check coordinates (x, y positions)
- Ensure colors use `#RRGGBB` format
- Test ticket size fits content

### Want to preview PDF without email?
Visit: `http://localhost:3001/api/admin/preview-ticket?team_id=YOUR_TEAM_ID`
