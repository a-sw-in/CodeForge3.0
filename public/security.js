/**
 * Console Protection and Anti-Tampering Script
 * This script helps prevent console manipulation and alerts users about security risks
 */

(function() {
  'use strict';
  
  // Detect DevTools
  let devtoolsOpen = false;
  const threshold = 160;
  
  const detectDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        warnUser();
      }
    } else {
      devtoolsOpen = false;
    }
  };
  
  // Warning message
  const warnUser = () => {
    console.clear();
    
    const styles = [
      'font-size: 24px',
      'font-weight: bold',
      'color: #ff0000',
      'text-shadow: 2px 2px 4px rgba(0,0,0,0.5)',
      'padding: 20px',
      'background: linear-gradient(to right, #ff0000, #ff6b6b)',
      '-webkit-background-clip: text',
      '-webkit-text-fill-color: transparent'
    ].join(';');
    
    console.log('%c⚠️ SECURITY WARNING ⚠️', styles);
    console.log(
      '%c🛑 STOP! This is a browser feature intended for developers.',
      'font-size: 16px; font-weight: bold; color: #ff6b6b;'
    );
    console.log(
      '%c⚡ If someone told you to copy-paste something here, it is a scam!',
      'font-size: 14px; color: #ff9999;'
    );
    console.log(
      '%c🔒 Pasting code here could compromise your account and data.',
      'font-size: 14px; color: #ff9999;'
    );
    console.log(
      '%cℹ️ Learn more: https://en.wikipedia.org/wiki/Self-XSS',
      'font-size: 12px; color: #cccccc;'
    );
  };
  
  // Protect against localStorage manipulation
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;
  const originalRemoveItem = localStorage.removeItem;
  
  let localStorageWarned = false;
  
  // Override localStorage.setItem
  localStorage.setItem = function(key, value) {
    if (!localStorageWarned && (key === 'teamSession' || key === 'admin_token')) {
      console.warn(
        '%c⚠️ WARNING: Modifying session data directly can break your application or be a security risk!',
        'font-size: 14px; font-weight: bold; color: #ff6b6b; background: #fff3cd; padding: 10px;'
      );
      localStorageWarned = true;
    }
    return originalSetItem.apply(this, arguments);
  };
  
  // Protect critical functions
  const protectedFunctions = {
    fetch: window.fetch,
    XMLHttpRequest: window.XMLHttpRequest,
    WebSocket: window.WebSocket,
  };
  
  // Monitor fetch calls
  window.fetch = function() {
    // Log suspicious patterns in production you might want to block these
    const url = arguments[0];
    if (typeof url === 'string') {
      if (url.includes('localStorage') || url.includes('sessionStorage')) {
        console.warn('%c🔒 Suspicious fetch detected', 'color: orange; font-weight: bold;');
      }
    }
    return protectedFunctions.fetch.apply(this, arguments);
  };
  
  // Prevent eval in production
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    window.eval = function() {
      console.error('%c🚫 eval() is disabled for security', 'color: red; font-size: 16px; font-weight: bold;');
      throw new Error('eval() is disabled for security reasons');
    };
  }
  
  // Detect console manipulation attempts
  const checkIntegrity = () => {
    // Check if localStorage has been tampered with
    try {
      const session = localStorage.getItem('teamSession');
      if (session) {
        const parsed = JSON.parse(session);
        
        // Verify session structure
        if (parsed && typeof parsed === 'object') {
          const requiredFields = ['teamId', 'teamName', 'leaderEmail'];
          const hasAllFields = requiredFields.every(field => field in parsed);
          
          if (!hasAllFields) {
            console.error('%c🚫 Session tampering detected!', 'color: red; font-size: 16px; font-weight: bold;');
            localStorage.removeItem('teamSession');
            window.location.reload();
          }
        }
      }
    } catch (e) {
      // Invalid JSON in localStorage
      console.error('%c🚫 Invalid session data detected', 'color: red; font-size: 16px;');
      localStorage.removeItem('teamSession');
      window.location.reload();
    }
  };
  
  // Periodic checks
  setInterval(detectDevTools, 1000);
  setInterval(checkIntegrity, 5000);
  
  // Initial warning
  if (typeof console !== 'undefined') {
    setTimeout(warnUser, 1000);
  }
  
  // Detect paste events in console (limited effectiveness)
  document.addEventListener('paste', (e) => {
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    
    // Check for suspicious patterns
    if (
      pastedText.includes('localStorage') ||
      pastedText.includes('sessionStorage') ||
      pastedText.includes('cookie') ||
      pastedText.includes('<script') ||
      pastedText.includes('eval(')
    ) {
      console.warn(
        '%c🚫 SUSPICIOUS PASTE DETECTED!',
        'font-size: 18px; font-weight: bold; color: white; background: red; padding: 10px;'
      );
      console.warn(
        '%c⚠️ This looks like a potential scam attempt. Do not proceed!',
        'font-size: 14px; color: #ff6b6b;'
      );
    }
  });
  
  // Prevent right-click in production (optional - can be annoying for users)
  // if (process.env.NODE_ENV === 'production') {
  //   document.addEventListener('contextmenu', (e) => {
  //     e.preventDefault();
  //     return false;
  //   });
  // }
  
  // Freeze important objects
  if (Object.freeze) {
    Object.freeze(console);
  }
  
  console.log('%c✅ Security monitoring active', 'color: green; font-weight: bold;');
})();
