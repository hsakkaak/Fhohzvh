const crypto = require('crypto');
const { USER_AGENTS } = require('./constants');

function generateUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function generateClientID() {
  return crypto.randomBytes(16).toString('hex');
}

function generateOfflineThreadingID() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 4294967295);
  return (BigInt(timestamp) << BigInt(22)) + BigInt(random);
}

function formatCookie(cookies) {
  if (Array.isArray(cookies)) {
    return cookies.map(c => {
      const key = c.key || c.name;
      return `${key}=${c.value}`;
    }).join('; ');
  }
  return cookies;
}

function parseCookies(cookieString) {
  const cookies = [];
  const parts = cookieString.split(';');
  
  for (const part of parts) {
    const [key, value] = part.trim().split('=');
    if (key && value) {
      cookies.push({ key, value });
    }
  }
  
  return cookies;
}

function getCookieValue(cookies, key) {
  if (Array.isArray(cookies)) {
    const cookie = cookies.find(c => c.key === key || c.name === key);
    return cookie ? cookie.value : null;
  }
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          reject(error);
        } else {
          const delay = initialDelay * Math.pow(2, retries - 1);
          setTimeout(attempt, delay);
        }
      }
    };
    
    attempt();
  });
}

function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function formatError(error) {
  return {
    message: error.message,
    code: error.code,
    name: error.name,
    details: error.details || {}
  };
}

function isValidAppState(appState) {
  if (!Array.isArray(appState)) return false;
  if (appState.length === 0) return false;
  
  const requiredCookies = ['c_user', 'xs'];
  const cookieKeys = appState.map(c => c.key || c.name);
  
  return requiredCookies.every(key => cookieKeys.includes(key));
}

function sanitizeThreadID(threadID) {
  return String(threadID);
}

function sanitizeMessageID(messageID) {
  return String(messageID);
}

module.exports = {
  generateUserAgent,
  generateClientID,
  generateOfflineThreadingID,
  formatCookie,
  parseCookies,
  getCookieValue,
  sleep,
  retryWithBackoff,
  getTimestamp,
  formatError,
  isValidAppState,
  sanitizeThreadID,
  sanitizeMessageID
};
