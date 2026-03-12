# Ticket System - Quick Start Guide

## Your Ticket System is Ready! 🎫

### What's Done

✅ **SVG Template**: `src/lib/ticket.svg` is your design file  
✅ **Dynamic Data**: System replaces placeholders with team information  
✅ **PDF Conversion**: SVG is automatically converted to PDF  
✅ **Email Delivery**: PDF tickets sent to team leaders  

### How to Add Team Data to Your SVG

Your `ticket.svg` file needs text placeholders. Open it in a text/SVG editor and add these where you want dynamic data:

**Available Placeholders:**
```
{{TEAM_NAME}}      → Team name (e.g., "INNOVATORS")
{{TICKET_NO}}      → Ticket number (e.g., "CF3-0042")
{{LEADER_NAME}}    → Leader's name (e.g., "John Doe")
{{TEAM_ID}}        → Team ID (e.g., "0042")
{{MEMBERS}}        → Number of members (e.g., "4")
```

### Example: Adding Team Name

Find a spot in your SVG and add:
```xml
<text x="100" y="50" font-family="Arial" font-size="20" fill="#000000">
  {{TEAM_NAME}}
</text>
```

### How to Edit Your SVG

**Option 1: Text Editor (For quick edits)**
1. Open `src/lib/ticket.svg` in VS Code or Notepad
2. Search for existing `<text>` tags
3. Replace the content with placeholders like `{{TEAM_NAME}}`

**Option 2: Design Tool (For visual editing)**
1. Open `src/lib/ticket.svg` in Figma, Inkscape, or Adobe Illustrator
2. Add text elements where you want data
3. Replace the text content with placeholders
4. Save/Export as SVG (keep same filename)

### Testing Your Ticket

1. Edit `src/lib/ticket.svg` and add placeholders
2. Start the dev server: `npm run dev`
3. In admin panel, approve a test team
4. Check the generated PDF ticket

### Example Team Data

When a team registers, the system will replace:
- `{{TEAM_NAME}}` → "TEAM ROCKET"
- `{{TICKET_NO}}` → "CF3-0001"
- `{{LEADER_NAME}}` → "Ash Ketchum"
- `{{TEAM_ID}}` → "0001"
- `{{MEMBERS}}` → "3"

### Files Modified

- ✅ `src/lib/ticketGenerator.js` - New ticket generation system
- ✅ `src/app/api/admin/preview-ticket/route.js` - Preview tickets as PDF
- ✅ `src/app/api/admin/send-ticket/route.js` - Send PDF via email
- ✅ `src/app/api/admin/teams/route.js` - Generate tickets on approval
- ✅ `package.json` - Added `canvas` package for SVG→PDF conversion

### What Happens When Team is Approved

1. Admin approves team in dashboard
2. System reads `ticket.svg` file
3. Replaces all `{{placeholders}}` with actual team data
4. Converts SVG to high-quality PDF
5. Emails PDF to team leader
6. Team downloads and prints their ticket

### Ticket Email Content

Teams receive:
- **Subject**: 🎉 Your CodeForge 3.0 Ticket is Ready!
- **Attachment**: `CodeForge3.0_Ticket_TEAMNAME.pdf`
- **Instructions**: Download, print, bring to event

### Important Notes

- ✅ Tickets sent as **PDF** (not SVG) for maximum compatibility
- ✅ SVG template is **never** sent to users - only used for generation
- ✅ PDF size matches SVG viewBox: 612x198 pixels
- ✅ Font embedding: Make sure fonts in SVG are web-safe or embedded

### Troubleshooting

**If placeholders don't get replaced:**
- Check spelling: Must be exact (e.g., `{{TEAM_NAME}}` not `{{team_name}}`)
- Check SVG structure: Make sure they're inside `<text>` elements
- Check file location: Must be `src/lib/ticket.svg`

**If PDF looks wrong:**
- SVG might be too complex (gradients, filters might not render perfectly)
- Try simplifying the SVG design
- Check SVG dimensions match 612x198

**If email doesn't send:**
- Check Brevo API configuration
- Verify team has valid email address
- Check server logs for errors

### Next Steps

1. **Now**: Edit your `ticket.svg` and add placeholders where you want team data
2. **Test**: Approve a test team and check the PDF
3. **Refine**: Adjust positioning, fonts, colors as needed
4. **Deploy**: Your ticket system is production-ready!

---

Need help? Check `TICKET_SVG_GUIDE.md` for detailed examples.
