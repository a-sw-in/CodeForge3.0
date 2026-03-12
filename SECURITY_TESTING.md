# 🔒 Security Testing Guide

## Overview
This directory contains security testing tools for CodeForge 3.0 to validate all implemented security measures.

---

## 🧪 Available Tests

### 1. **Server-Side Security Test** (`security-test.js`)
Node.js script that tests server-side security features.

### 2. **Client-Side Security Test** (`public/security-test.html`)
Browser-based interactive security testing page.

---

## 🚀 Running Security Tests

### Server-Side Tests (Node.js)

```bash
# Make sure your dev server is running first
npm run dev

# In another terminal, run the security test
node security-test.js

# Or test a specific URL
node security-test.js http://localhost:3000
```

**What it tests:**
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Rate limiting
- ✅ XSS protection
- ✅ SQL injection protection
- ✅ Session security
- ✅ Authentication endpoints
- ✅ Input validation
- ✅ CORS configuration

---

### Client-Side Tests (Browser)

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open the test page:**
   ```
   http://localhost:3000/security-test.html
   ```

3. **Click "Run All Tests"**

**What it tests:**
- ✅ Console protection
- ✅ LocalStorage monitoring
- ✅ XSS protection
- ✅ CSP headers
- ✅ Session validation
- ✅ Cookie security
- ✅ Frame protection
- ✅ Browser security features
- ✅ Input sanitization

---

## 📊 Understanding Test Results

### Server-Side Results

```
✓ Green = Passed
✗ Red = Failed (security issue)
⚠ Yellow = Warning (non-critical)
```

**Security Score:**
- **90-100%**: Excellent ✅
- **70-89%**: Good ⚠️
- **Below 70%**: Critical Issues 🚨

### Client-Side Results

The browser test provides an interactive dashboard showing:
- Real-time test execution
- Color-coded results
- Detailed explanations
- Overall security score

---

## 🔍 Test Details

### Security Headers Test
Validates all HTTP security headers:
```
Content-Security-Policy
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
X-XSS-Protection
Permissions-Policy
Strict-Transport-Security (HSTS)
```

### Rate Limiting Test
Makes rapid requests to verify rate limiting is active:
```
- Sends 10 concurrent requests
- Expects some to return 429 (Too Many Requests)
- Validates throttling configuration
```

### XSS Protection Test
Tests common XSS attack vectors:
```html
<script>alert("XSS")</script>
javascript:alert(1)
<img src=x onerror=alert(1)>
```

### SQL Injection Test
Tests common SQL injection patterns:
```sql
' OR '1'='1
admin'--
1' DROP TABLE teams--
```

### Authentication Test
Validates protected routes:
```
- /admin/dashboard (should redirect)
- /api/admin/teams (should return 401)
- Proper authorization checks
```

---

## 🛠️ Manual Testing Checklist

Some security features require manual verification:

### ✅ Console Protection
1. Open browser console (F12)
2. Verify security warning appears
3. Try modifying localStorage
4. Check for warning messages

### ✅ Session Tampering
```javascript
// Try in console
localStorage.setItem('teamSession', JSON.stringify({
  teamId: 'fake',
  approved: true
}));
// Should be detected and removed
```

### ✅ File Upload Security
1. Try uploading non-image files
2. Verify file size limits
3. Check file type validation
4. Test multiple file uploads

### ✅ Admin Panel Access
1. Try accessing `/admin/dashboard` without login
2. Verify redirect to login page
3. Test with invalid credentials
4. Check session timeout

---

## 🐛 Common Issues & Fixes

### Issue: Server-Side Tests Failing

**Solution:**
```bash
# Make sure server is running
npm run dev

# Check if port 3000 is available
netstat -an | findstr :3000

# Try different port
node security-test.js http://localhost:3001
```

### Issue: Rate Limiting Not Detected

**Solution:**
- Rate limiting may need more requests (increase loop count)
- Check middleware configuration
- May be disabled in development mode

### Issue: CSP Headers Missing

**Solution:**
```bash
# Restart server after middleware changes
npm run dev

# Clear browser cache
# Hard refresh: Ctrl + Shift + R
```

---

## 📈 Continuous Testing

### Add to package.json:
```json
{
  "scripts": {
    "security-test": "node security-test.js",
    "test:security": "npm run dev & sleep 5 && npm run security-test"
  }
}
```

### Run Before Deployment:
```bash
npm run security-test
```

---

## 🔐 Production Checklist

Before deploying to production, verify:

- [ ] All security tests passing (>90% score)
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials not exposed
- [ ] Admin routes protected
- [ ] Rate limiting configured
- [ ] CSP headers strict
- [ ] File upload restrictions in place
- [ ] Error messages don't expose sensitive data
- [ ] Logging configured properly
- [ ] Security headers enabled
- [ ] Session timeout configured
- [ ] Input validation on all forms
- [ ] XSS protection active
- [ ] SQL injection prevention verified

---

## 📚 Additional Resources

- **OWASP Testing Guide**: https://owasp.org/www-project-web-security-testing-guide/
- **Security Headers**: https://securityheaders.com/
- **Mozilla Observatory**: https://observatory.mozilla.org/
- **CSP Evaluator**: https://csp-evaluator.withgoogle.com/

---

## 🆘 Reporting Security Issues

If you find a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email: ieeesbucek@gmail.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## 📝 Test History

Keep track of your security tests:

| Date | Score | Issues Found | Status |
|------|-------|--------------|--------|
| 2026-03-12 | 85% | 3 warnings | ✅ Pass |
|   |   |   |   |

---

**Last Updated**: March 12, 2026  
**Status**: ✅ **Active**  
**Next Review**: Before Production Deployment
