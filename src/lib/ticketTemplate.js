// Ticket SVG Template for CodeForge 3.0
export function generateTicketSVG(teamData) {
  const { team_name, leader_name, leader_email, team_id, total_members } = teamData;
  
  return `
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="400" fill="#0055FF"/>
  
  <!-- Y2K Grid Pattern -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    </pattern>
    
    <!-- Star burst definition -->
    <polygon id="star" points="50,2 59,29 81,15 70,40 97,34 79,55 100,50 79,45 97,66 70,60 81,85 59,71 50,98 41,71 19,85 30,60 3,66 21,45 0,50 21,55 3,34 30,40 19,15 41,29" fill="#CCFF00"/>
  </defs>
  
  <rect width="800" height="400" fill="url(#grid)"/>
  
  <!-- Decorative star bursts -->
  <use href="#star" transform="translate(50, 30) scale(0.4)" opacity="0.6"/>
  <use href="#star" transform="translate(720, 50) scale(0.5)" opacity="0.7"/>
  <use href="#star" transform="translate(680, 330) scale(0.3)" opacity="0.5"/>
  
  <!-- Main ticket border -->
  <rect x="40" y="40" width="720" height="320" fill="none" stroke="#CCFF00" stroke-width="4" stroke-dasharray="10,5"/>
  
  <!-- Ticket content box -->
  <rect x="60" y="60" width="680" height="280" fill="#FFFFFF" stroke="#001A6E" stroke-width="3"/>
  
  <!-- Header section -->
  <rect x="60" y="60" width="680" height="80" fill="#CCFF00" stroke="#001A6E" stroke-width="3"/>
  
  <!-- Event title -->
  <text x="400" y="95" font-family="Press Start 2P, monospace" font-size="24" fill="#001A6E" text-anchor="middle" font-weight="bold">
    CODEFORGE 3.0
  </text>
  <text x="400" y="125" font-family="Press Start 2P, monospace" font-size="12" fill="#001A6E" text-anchor="middle">
    OFFICIAL ENTRY TICKET
  </text>
  
  <!-- Separator line -->
  <line x1="60" y1="140" x2="740" y2="140" stroke="#001A6E" stroke-width="3"/>
  
  <!-- Team details section -->
  <text x="100" y="180" font-family="Press Start 2P, monospace" font-size="14" fill="#001A6E" font-weight="bold">
    TEAM: ${team_name.toUpperCase()}
  </text>
  
  <text x="100" y="210" font-family="Press Start 2P, monospace" font-size="10" fill="#001A6E">
    TEAM ID: #${String(team_id).padStart(4, '0')}
  </text>
  
  <text x="100" y="240" font-family="Press Start 2P, monospace" font-size="10" fill="#001A6E">
    LEADER: ${leader_name.toUpperCase()}
  </text>
  
  <text x="100" y="270" font-family="Press Start 2P, monospace" font-size="10" fill="#001A6E">
    SIZE: ${total_members} MEMBERS
  </text>
  
  <!-- QR Code placeholder (right side) -->
  <rect x="580" y="160" width="120" height="120" fill="#FFFFFF" stroke="#001A6E" stroke-width="2"/>
  <text x="640" y="225" font-family="Press Start 2P, monospace" font-size="8" fill="#001A6E" text-anchor="middle">
    QR CODE
  </text>
  
  <!-- Footer -->
  <text x="100" y="315" font-family="Press Start 2P, monospace" font-size="8" fill="#64748B">
    IEEE UCEK BRANCH | 24-HOUR HACKATHON
  </text>
  
  <!-- Ticket ID -->
  <text x="700" y="315" font-family="Press Start 2P, monospace" font-size="8" fill="#64748B" text-anchor="end">
    TICKET-${team_id}
  </text>
  
  <!-- Decorative corner elements -->
  <circle cx="70" cy="70" r="5" fill="#FF44AA"/>
  <circle cx="730" cy="70" r="5" fill="#FF44AA"/>
  <circle cx="70" cy="330" r="5" fill="#FF44AA"/>
  <circle cx="730" cy="330" r="5" fill="#FF44AA"/>
</svg>
  `.trim();
}
