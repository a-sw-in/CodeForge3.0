/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} input - Raw HTML string
 * @returns {string} - Sanitized string
 */
export function sanitizeHTML(input) {
  if (typeof input !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input for database queries
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove any SQL injection attempts
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .trim();
}

/**
 * Validate session data structure
 * @param {object} session - Session object from localStorage
 * @returns {boolean} - True if session has valid structure
 */
export function isValidSessionStructure(session) {
  if (!session || typeof session !== 'object') return false;
  
  const requiredFields = ['teamId', 'teamName', 'leaderEmail'];
  return requiredFields.every(field => session.hasOwnProperty(field));
}

/**
 * Generate CSRF token
 * @returns {string} - Random CSRF token
 */
export function generateCSRFToken() {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for older browsers
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Verify CSRF token
 * @param {string} token - Token to verify
 * @param {string} storedToken - Stored token from session
 * @returns {boolean} - True if tokens match
 */
export function verifyCSRFToken(token, storedToken) {
  if (!token || !storedToken) return false;
  return token === storedToken;
}

/**
 * Prevent object injection attacks
 * @param {any} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return {};
  
  const sanitized = {};
  const allowedKeys = ['teamId', 'teamName', 'leaderEmail', 'totalMembers', 'approved'];
  
  for (const key of allowedKeys) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'boolean' || typeof obj[key] === 'number') {
        sanitized[key] = obj[key];
      }
    }
  }
  
  return sanitized;
}

/**
 * Rate limit checker for client-side
 * @param {string} key - Unique key for the action
 * @param {number} limit - Maximum attempts
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if within limit
 */
export function checkClientRateLimit(key, limit = 10, windowMs = 60000) {
  if (typeof window === 'undefined') return true;
  
  const storageKey = `rateLimit_${key}`;
  const stored = sessionStorage.getItem(storageKey);
  const now = Date.now();
  
  let data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };
  
  // Reset if window expired
  if (now > data.resetTime) {
    data = { count: 0, resetTime: now + windowMs };
  }
  
  data.count++;
  sessionStorage.setItem(storageKey, JSON.stringify(data));
  
  return data.count <= limit;
}

/**
 * Detect potential XSS in input
 * @param {string} input - Input to check
 * @returns {boolean} - True if potential XSS detected
 */
export function detectXSS(input) {
  if (typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onload, etc.
    /<iframe/i,
    /eval\(/i,
    /expression\(/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Secure localStorage wrapper
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} ttl - Time to live in milliseconds
 */
export function secureSetItem(key, value, ttl = null) {
  if (typeof window === 'undefined') return;
  
  const data = {
    value,
    timestamp: Date.now(),
    ttl,
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to set item in localStorage:', error);
  }
}

/**
 * Secure localStorage retrieval
 * @param {string} key - Storage key
 * @returns {any} - Retrieved value or null if expired/invalid
 */
export function secureGetItem(key) {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Check if expired
    if (data.ttl && Date.now() - data.timestamp > data.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data.value;
  } catch (error) {
    console.error('Failed to get item from localStorage:', error);
    return null;
  }
}
