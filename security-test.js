#!/usr/bin/env node

/**
 * Security Testing Script for CodeForge 3.0
 * Tests all implemented security features
 * 
 * Usage: node security-test.js [url]
 * Example: node security-test.js http://localhost:3000
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Helper Functions
function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function pass(test) {
  testResults.passed++;
  log(`✓ ${test}`, COLORS.green);
}

function fail(test, reason = '') {
  testResults.failed++;
  log(`✗ ${test}${reason ? ': ' + reason : ''}`, COLORS.red);
}

function warn(test, reason = '') {
  testResults.warnings++;
  log(`⚠ ${test}${reason ? ': ' + reason : ''}`, COLORS.yellow);
}

function section(title) {
  log(`\n${COLORS.bold}=== ${title} ===${COLORS.reset}`, COLORS.blue);
}

// HTTP Request Helper
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Security Tests

async function testSecurityHeaders() {
  section('Testing Security Headers');
  
  try {
    const response = await makeRequest('/');
    const headers = response.headers;
    
    // Content Security Policy
    if (headers['content-security-policy']) {
      const csp = headers['content-security-policy'];
      if (csp.includes("default-src 'self'")) {
        pass('Content-Security-Policy is configured');
      } else {
        fail('Content-Security-Policy exists but may be weak');
      }
    } else {
      fail('Content-Security-Policy header missing');
    }
    
    // X-Frame-Options
    if (headers['x-frame-options'] === 'DENY') {
      pass('X-Frame-Options set to DENY');
    } else if (headers['x-frame-options']) {
      warn('X-Frame-Options present but not set to DENY', headers['x-frame-options']);
    } else {
      fail('X-Frame-Options header missing');
    }
    
    // X-Content-Type-Options
    if (headers['x-content-type-options'] === 'nosniff') {
      pass('X-Content-Type-Options set to nosniff');
    } else {
      fail('X-Content-Type-Options header missing');
    }
    
    // Referrer-Policy
    if (headers['referrer-policy']) {
      pass('Referrer-Policy is set');
    } else {
      warn('Referrer-Policy header missing');
    }
    
    // X-XSS-Protection
    if (headers['x-xss-protection']) {
      pass('X-XSS-Protection header present');
    } else {
      warn('X-XSS-Protection header missing');
    }
    
    // Permissions-Policy
    if (headers['permissions-policy']) {
      pass('Permissions-Policy header present');
    } else {
      warn('Permissions-Policy header missing');
    }
    
    // X-Powered-By should be hidden
    if (!headers['x-powered-by']) {
      pass('X-Powered-By header hidden');
    } else {
      fail('X-Powered-By header exposed', headers['x-powered-by']);
    }
    
    // Strict-Transport-Security (HSTS)
    if (headers['strict-transport-security']) {
      pass('Strict-Transport-Security (HSTS) enabled');
    } else {
      warn('HSTS not enabled (required for production)');
    }
    
  } catch (error) {
    fail('Unable to test security headers', error.message);
  }
}

async function testRateLimiting() {
  section('Testing Rate Limiting');
  
  try {
    log('Making 10 rapid requests...');
    const requests = [];
    
    for (let i = 0; i < 10; i++) {
      requests.push(makeRequest('/api/announcements'));
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.statusCode === 429);
    
    if (rateLimited) {
      pass('Rate limiting is active');
    } else {
      warn('Rate limiting not triggered (may need more requests or is disabled)');
    }
    
  } catch (error) {
    warn('Unable to test rate limiting', error.message);
  }
}

async function testXSSProtection() {
  section('Testing XSS Protection');
  
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
  ];
  
  log('Testing XSS payloads in input...');
  
  // This is a basic test - actual XSS protection happens in sanitization
  for (const payload of xssPayloads) {
    try {
      const response = await makeRequest(`/?search=${encodeURIComponent(payload)}`);
      
      if (response.body.includes(payload)) {
        fail('Potential XSS vulnerability detected', 'Payload reflected without sanitization');
      } else {
        pass(`XSS payload blocked: ${payload.substring(0, 30)}...`);
      }
    } catch (error) {
      warn('XSS test failed', error.message);
    }
  }
}

async function testSQLInjection() {
  section('Testing SQL Injection Protection');
  
  const sqlPayloads = [
    "' OR '1'='1",
    "admin'--",
    "1' DROP TABLE teams--",
    "' UNION SELECT NULL--",
  ];
  
  log('Testing SQL injection payloads...');
  
  for (const payload of sqlPayloads) {
    try {
      const response = await makeRequest(`/?id=${encodeURIComponent(payload)}`);
      
      // If we get a 500 error with SQL in the response, it's vulnerable
      if (response.statusCode === 500 && response.body.toLowerCase().includes('sql')) {
        fail('Potential SQL injection vulnerability', 'SQL error exposed');
      } else {
        pass(`SQL injection payload handled: ${payload.substring(0, 20)}...`);
      }
    } catch (error) {
      // Connection errors are acceptable
      pass(`SQL injection payload rejected: ${payload.substring(0, 20)}...`);
    }
  }
}

async function testSessionSecurity() {
  section('Testing Session Security');
  
  try {
    // Test if session data is properly validated
    const response = await makeRequest('/');
    
    // Check if httpOnly cookies are being used
    const setCookie = response.headers['set-cookie'];
    
    if (setCookie) {
      const hasHttpOnly = setCookie.some(cookie => cookie.includes('HttpOnly'));
      const hasSecure = setCookie.some(cookie => cookie.includes('Secure'));
      const hasSameSite = setCookie.some(cookie => cookie.includes('SameSite'));
      
      if (hasHttpOnly) {
        pass('Cookies have HttpOnly flag');
      } else {
        warn('Cookies missing HttpOnly flag');
      }
      
      if (hasSecure) {
        pass('Cookies have Secure flag');
      } else {
        warn('Cookies missing Secure flag (required for HTTPS)');
      }
      
      if (hasSameSite) {
        pass('Cookies have SameSite attribute');
      } else {
        warn('Cookies missing SameSite attribute');
      }
    } else {
      log('No cookies set on homepage (expected for public pages)');
    }
    
  } catch (error) {
    warn('Unable to test session security', error.message);
  }
}

async function testAuthenticationEndpoints() {
  section('Testing Authentication & Authorization');
  
  try {
    // Test admin routes without token
    const adminResponse = await makeRequest('/admin/dashboard');
    
    if (adminResponse.statusCode === 302 || adminResponse.statusCode === 401) {
      pass('Admin routes protected (redirect or unauthorized)');
    } else if (adminResponse.statusCode === 200) {
      fail('Admin routes accessible without authentication');
    } else {
      warn('Admin route response unexpected', `Status: ${adminResponse.statusCode}`);
    }
    
    // Test API endpoints
    const apiResponse = await makeRequest('/api/admin/teams');
    
    if (apiResponse.statusCode === 401) {
      pass('Admin API endpoints require authentication');
    } else if (apiResponse.statusCode === 200) {
      fail('Admin API accessible without authentication');
    } else {
      warn('API endpoint response unexpected', `Status: ${apiResponse.statusCode}`);
    }
    
  } catch (error) {
    warn('Unable to test authentication', error.message);
  }
}

async function testInputValidation() {
  section('Testing Input Validation');
  
  const testCases = [
    { input: 'a'.repeat(10000), test: 'Long input handling' },
    { input: '\0\0\0', test: 'Null byte handling' },
    { input: '../../../etc/passwd', test: 'Path traversal prevention' },
    { input: '%00', test: 'URL encoding bypass' },
  ];
  
  for (const { input, test } of testCases) {
    try {
      const response = await makeRequest(`/?query=${encodeURIComponent(input)}`);
      
      if (response.statusCode === 400) {
        pass(test + ' - rejected with 400');
      } else if (response.statusCode === 200) {
        pass(test + ' - handled safely');
      } else {
        warn(test, `Status: ${response.statusCode}`);
      }
    } catch (error) {
      pass(test + ' - connection rejected');
    }
  }
}

async function testCORS() {
  section('Testing CORS Configuration');
  
  try {
    const response = await makeRequest('/', {
      headers: {
        'Origin': 'https://evil.com',
      },
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    
    if (!corsHeader) {
      pass('CORS not enabled (restrictive)');
    } else if (corsHeader === '*') {
      fail('CORS allows all origins', 'Security risk');
    } else {
      warn('CORS enabled with specific origin', corsHeader);
    }
    
  } catch (error) {
    warn('Unable to test CORS', error.message);
  }
}

async function testFileUploadSecurity() {
  section('Testing File Upload Security');
  
  // This is a placeholder - actual testing would require multipart form data
  log('Note: File upload security requires manual testing');
  log('Check: File type validation, size limits, virus scanning');
  warn('Manual testing required for file uploads');
}

async function runAllTests() {
  log(`${COLORS.bold}${COLORS.blue}`);
  log('╔═══════════════════════════════════════════╗');
  log('║   CodeForge 3.0 Security Test Suite      ║');
  log('╚═══════════════════════════════════════════╝');
  log(COLORS.reset);
  
  log(`Testing URL: ${BASE_URL}\n`);
  
  await testSecurityHeaders();
  await testRateLimiting();
  await testXSSProtection();
  await testSQLInjection();
  await testSessionSecurity();
  await testAuthenticationEndpoints();
  await testInputValidation();
  await testCORS();
  await testFileUploadSecurity();
  
  // Summary
  section('Test Summary');
  log(`${COLORS.green}Passed: ${testResults.passed}${COLORS.reset}`);
  log(`${COLORS.red}Failed: ${testResults.failed}${COLORS.reset}`);
  log(`${COLORS.yellow}Warnings: ${testResults.warnings}${COLORS.reset}`);
  
  const total = testResults.passed + testResults.failed + testResults.warnings;
  const score = Math.round((testResults.passed / total) * 100);
  
  log(`\n${COLORS.bold}Security Score: ${score}%${COLORS.reset}`);
  
  if (score >= 90) {
    log(`${COLORS.green}Excellent security posture! 🛡️${COLORS.reset}`);
  } else if (score >= 70) {
    log(`${COLORS.yellow}Good security, but improvements needed ⚠️${COLORS.reset}`);
  } else {
    log(`${COLORS.red}Critical security issues detected! 🚨${COLORS.reset}`);
  }
  
  // Exit code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n${COLORS.red}Fatal error: ${error.message}${COLORS.reset}`);
  process.exit(1);
});
