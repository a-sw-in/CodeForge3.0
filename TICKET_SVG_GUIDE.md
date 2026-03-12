# Ticket SVG Placeholder Guide

## How to Add Dynamic Data to ticket.svg

Your ticket system now reads `src/lib/ticket.svg`, replaces placeholders with team data, and converts it to PDF for email delivery.

### Available Placeholders

Add these placeholders anywhere in your SVG file where you want dynamic data:

- `{{TEAM_NAME}}` - Team name (uppercase)
- `{{TICKET_NO}}` - Formatted ticket number (e.g., CF3-0001)
- `{{LEADER_NAME}}` - Team leader's name
- `{{TEAM_ID}}` - Team ID (4-digit padded, e.g., 0042)
- `{{MEMBERS}}` - Number of team members

### How to Edit ticket.svg

1. Open `src/lib/ticket.svg` in a text editor or SVG editor (like Inkscape, Figma, etc.)

2. Find the location where you want to display team data

3. Add a `<text>` element with placeholder, for example:

```xml
<!-- Team Name -->
<text x="100" y="50" font-family="Arial" font-size="16" fill="#000000">
  {{TEAM_NAME}}
</text>

<!-- Ticket Number -->
<text x="100" y="80" font-family="Arial" font-size="12" fill="#666666">
  Ticket: {{TICKET_NO}}
</text>

<!-- Leader Name -->
<text x="100" y="110" font-family="Arial" font-size="12" fill="#666666">
  Leader: {{LEADER_NAME}}
</text>

<!-- Team Size -->
<text x="100" y="140" font-family="Arial" font-size="12" fill="#666666">
  Team Size: {{MEMBERS}} members
</text>
```

### Example SVG Structure

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300">
  <!-- Background -->
  <rect width="600" height="300" fill="#0055FF"/>
  
  <!-- Title -->
  <text x="300" y="50" text-anchor="middle" font-size="24" fill="#FFFFFF">
    CodeForge 3.0 Ticket
  </text>
  
  <!-- Dynamic Team Data -->
  <text x="50" y="100" font-size="16" fill="#FFFFFF">
    Team: {{TEAM_NAME}}
  </text>
  
  <text x="50" y="130" font-size="14" fill="#CCFF00">
    Ticket No: {{TICKET_NO}}
  </text>
  
  <text x="50" y="160" font-size="12" fill="#FFFFFF">
    Leader: {{LEADER_NAME}}
  </text>
  
  <text x="50" y="190" font-size="12" fill="#FFFFFF">
    Team Size: {{MEMBERS}} Members
  </text>
</svg>
```

## How It Works

1. **Team registers** → Data stored in database
2. **Admin approves team** → System triggers ticket generation
3. **System reads** `ticket.svg` file
4. **Replaces placeholders** with actual team data:
   - `{{TEAM_NAME}}` → "INNOVATORS"
   - `{{TICKET_NO}}` → "CF3-0042"
   - `{{LEADER_NAME}}` → "John Doe"
   - `{{TEAM_ID}}` → "0042"
   - `{{MEMBERS}}` → "4"
5. **Converts SVG to PDF** using canvas rendering
6. **Emails PDF** to team leader

## Testing Your Changes

1. Edit `src/lib/ticket.svg` with your placeholders
2. Save the file
3. In admin panel, approve a test team
4. System will generate PDF and send email
5. Check the PDF to see if placeholders were replaced correctly

## Tips

- Use clear, readable fonts
- Consider print quality when choosing font sizes
- Test with long team names to ensure they fit
- Use contrasting colors for readability
- The SVG dimensions (612x198) match standard ticket sizes

## Current Implementation

The system uses these files:
- **SVG Template**: `src/lib/ticket.svg` (your design)
- **Generator**: `src/lib/ticketGenerator.js` (handles replacement & conversion)
- **Email Sender**: API routes send PDF as email attachment

All tickets are sent as **PDF files** (not SVG) to ensure compatibility with all email clients and devices.
