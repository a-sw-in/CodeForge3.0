# Security Improvements Needed

## Critical Issues

### 1. Replace localStorage with httpOnly Cookies
**Current:** Team session stored in localStorage (client-accessible)  
**Fix:** Store in httpOnly cookies (not accessible via JavaScript)

```javascript
// Server-side (API route):
export async function POST(request) {
  // After validating team...
  cookies().set('team_session', encryptedSessionData, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  });
}
```

### 2. Server-Side Session Verification
Create middleware to verify every request:

```javascript
// src/middleware.js
export async function middleware(request) {
  const session = request.cookies.get('team_session');
  
  if (protectedRoute && !isValidSession(session)) {
    return NextResponse.redirect('/login');
  }
}
```

### 3. API Endpoint Protection
All sensitive endpoints should verify session server-side:

```javascript
// Example: /api/team/data
export async function GET(request) {
  const session = await getServerSession(request);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verify team exists in database
  const team = await supabase
    .from('teams')
    .select('*')
    .eq('team_id', session.teamId)
    .single();
    
  if (!team) {
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  }
  
  return Response.json({ data: team });
}
```

### 4. Use Server Components
Render sensitive data in Server Components instead of Client Components:

```javascript
// app/dashboard/page.js (Server Component)
export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const team = await getTeamData(session.teamId);
  
  return <DashboardClient team={team} />;
}
```

### 5. Secure State Management
Use server-validated state:

```javascript
// Instead of client-side showDashboard state,
// use URL-based routing with middleware protection
// /dashboard route protected by middleware
```

## Implementation Priority

1. **High Priority:**
   - Move to httpOnly cookies
   - Add server-side session verification
   - Protect all API endpoints

2. **Medium Priority:**
   - Implement middleware authentication
   - Move to Server Components for sensitive data
   - Add CSRF protection

3. **Low Priority:**
   - Rate limiting
   - Session expiry handling
   - Audit logging

## Quick Fix (Minimal Changes)

If you need a quick improvement without major refactoring:

1. Add server-side validation to all API endpoints
2. Verify team_id in session matches database on EVERY request
3. Add token/signature to localStorage session that's verified server-side
4. Never trust client-side data for authorization decisions
