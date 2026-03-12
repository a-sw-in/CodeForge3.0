# 🔒 Security Implementation Guide

## Overview
This document describes the comprehensive security measures implemented to protect against script injection, console manipulation, and other web vulnerabilities.

---

## 🛡️ Security Features Implemented

### 1. **HTTP Security Headers** (middleware.js)

#### Content Security Policy (CSP)
Prevents XSS attacks by controlling which resources can be loaded:
```javascript
- default-src 'self' - Only load resources from same origin
- script-src 'self' 'unsafe-eval' 'unsafe-inline' - Required for Next.js
- connect-src 'self' https://*.supabase.co - Allow Supabase connections
- frame-ancestors 'none' - Prevent clickjacking
```

#### Additional Headers:
- **X-Frame-Options**: DENY - Prevents iframe embedding
- **X-Content-Type-Options**: nosniff - Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser XSS filter
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts camera, microphone, geolocation

### 2. **Rate Limiting** (middleware.js)
Prevents brute force and DDoS attacks:
- **100 requests per minute** per IP address
- Returns 429 (Too Many Requests) when exceeded
- Automatic reset after time window

### 3. **Console Protection** (public/security.js)

#### Features:
- **DevTools Detection**: Warns users when developer console is opened
- **localStorage Monitoring**: Alerts on suspicious modifications
- **Fetch Monitoring**: Logs suspicious API calls
- **eval() Disabled**: Prevents code injection in production
- **Session Validation**: Periodic integrity checks every 5 seconds
- **Anti-Paste Protection**: Detects dangerous clipboard content

#### User Warnings:
```
⚠️ SECURITY WARNING
🛑 STOP! This is a browser feature intended for developers.
⚡ If someone told you to copy-paste something here, it is a scam!
🔒 Pasting code here could compromise your account and data.
```

### 4. **Input Sanitization** (lib/security.js)

#### Functions:
- `sanitizeHTML()` - Escapes HTML special characters
- `sanitizeInput()` - Removes SQL injection attempts
- `detectXSS()` - Detects XSS patterns
- `sanitizeObject()` - Validates and sanitizes session objects
- `isValidEmail()` - Email format validation
- `isValidSessionStructure()` - Session structure validation

### 5. **Session Security** (page.js)

#### Validation Process:
1. **Structure Check**: Validates required fields exist
2. **XSS Detection**: Scans for malicious patterns
3. **Sanitization**: Cleans all input data
4. **Database Verification**: Confirms session matches database
5. **Auto-Cleanup**: Removes invalid sessions automatically

### 6. **Client-Side Rate Limiting** (lib/security.js)
```javascript
checkClientRateLimit('action', limit=10, windowMs=60000)
```
Prevents spam and abuse from client-side

### 7. **Secure Storage** (lib/security.js)
```javascript
secureSetItem(key, value, ttl) // With expiration
secureGetItem(key) // Auto-cleanup expired items
```

---

## 🚨 Threats Mitigated

### ✅ Cross-Site Scripting (XSS)
- CSP headers block malicious scripts
- Input sanitization removes script tags
- HTML escaping prevents code injection

### ✅ SQL Injection
- Input sanitization removes SQL keywords
- Supabase client uses parameterized queries
- Object sanitization validates data types

### ✅ Session Hijacking
- Database validation on every session check
- Continuous integrity monitoring
- Automatic session cleanup on tampering

### ✅ Clickjacking
- X-Frame-Options prevents iframe embedding
- CSP frame-ancestors directive

### ✅ MIME Type Attacks
- X-Content-Type-Options prevents type confusion

### ✅ Self-XSS Scams
- Console warnings educate users
- Paste detection alerts on suspicious content

### ✅ Brute Force Attacks
- Rate limiting on server and client
- IP-based request throttling

---

## 🔧 Configuration

### Environment Variables (Optional)
```env
# Stricter CSP in production
NODE_ENV=production

# Admin credentials (already configured)
ADMIN_USERNAME=your_admin
ADMIN_PASSWORD=your_password
ADMIN_SECRET_KEY=your_secret_key
```

### Customizable Settings

#### Rate Limiting (middleware.js)
```javascript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // requests per window
```

#### Session Integrity Checks (security.js)
```javascript
setInterval(checkIntegrity, 5000); // Check every 5 seconds
```

---

## 📋 Usage Examples

### Using Security Utilities

```javascript
import { 
  sanitizeHTML, 
  sanitizeInput, 
  detectXSS,
  checkClientRateLimit 
} from '@/lib/security';

// Sanitize user input
const cleanName = sanitizeInput(userInput);

// Check for XSS
if (detectXSS(content)) {
  console.error('XSS detected!');
  return;
}

// Rate limit form submissions
if (!checkClientRateLimit('submit-form', 5, 60000)) {
  alert('Too many attempts. Please wait.');
  return;
}

// Sanitize HTML before display
const safeHTML = sanitizeHTML(userGeneratedHTML);
```

---

## 🎯 Best Practices

### For Developers:
1. **Never trust client data** - Always validate server-side
2. **Use security utilities** - Import from lib/security.js
3. **Sanitize inputs** - Before database operations
4. **Validate sessions** - On every protected route
5. **Monitor console** - Check for security warnings during development

### For Users:
1. **Never paste code** in browser console
2. **Close DevTools** when not needed
3. **Report suspicious activity** immediately
4. **Use official links** only

---

## 🔍 Monitoring & Logging

### What Gets Logged:
- Rate limit violations
- Session tampering attempts
- XSS detection triggers
- Suspicious fetch requests
- Invalid session structures

### Console Messages:
- **Green ✅**: Security active
- **Orange ⚠️**: Warnings
- **Red 🚫**: Critical security events

---

## 🚀 Testing Security

### Test Console Protection:
1. Open DevTools (F12)
2. See security warning
3. Try to modify localStorage
4. See tampering warning

### Test Rate Limiting:
```javascript
// Rapid API calls
for (let i = 0; i < 150; i++) {
  fetch('/api/test');
}
// Should get 429 error after 100 requests
```

### Test XSS Protection:
```javascript
// This should be blocked/sanitized
const malicious = '<script>alert("XSS")</script>';
sanitizeHTML(malicious);
// Output: &lt;script&gt;alert("XSS")&lt;/script&gt;
```

---

## 📊 Security Checklist

- [x] HTTP Security Headers
- [x] Content Security Policy
- [x] XSS Protection
- [x] SQL Injection Prevention
- [x] Rate Limiting (Server)
- [x] Rate Limiting (Client)
- [x] Session Validation
- [x] Input Sanitization
- [x] Console Protection
- [x] Anti-Tampering
- [x] Clickjacking Prevention
- [x] MIME Sniffing Prevention
- [x] Secure Storage Wrapper
- [ ] CSRF Tokens (API routes) - TODO
- [ ] httpOnly Cookies - TODO (See SECURITY_IMPROVEMENTS.md)

---

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Self-XSS Wikipedia](https://en.wikipedia.org/wiki/Self-XSS)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

---

## 💡 Future Enhancements

See [SECURITY_IMPROVEMENTS.md](./SECURITY_IMPROVEMENTS.md) for:
- httpOnly Cookie Implementation
- Server-Side Session Management
- CSRF Token Protection
- Advanced Rate Limiting with Redis
- Audit Logging System

---

## 📞 Security Issues

If you discover a security vulnerability:
1. **Do NOT open a public issue**
2. Email: ieeesbucek@gmail.com
3. Include detailed information
4. Allow time for fix before disclosure

---

**Last Updated**: March 12, 2026  
**Security Level**: Enhanced  
**Status**: ✅ Active Protection
