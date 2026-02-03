class RateLimiter {
  constructor(logger) {
    this.logger = logger;
    this.requests = new Map();
    this.limits = {
      message: { perMinute: 20, perHour: 200 },
      api: { perMinute: 60, perHour: 600 },
      typing: { perMinute: 30, perHour: 300 }
    };
  }

  canMakeRequest(endpoint, type = 'api') {
    const now = Date.now();
    const limit = this.limits[type] || this.limits.api;
    
    if (!this.requests.has(endpoint)) {
      return true;
    }

    const endpointRequests = this.requests.get(endpoint);
    
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    
    const recentMinute = endpointRequests.filter(time => time > oneMinuteAgo);
    const recentHour = endpointRequests.filter(time => time > oneHourAgo);

    if (limit.perMinute && recentMinute.length >= limit.perMinute) {
      this.logger.warn(`Rate limit exceeded for ${endpoint}: ${recentMinute.length}/${limit.perMinute} per minute`);
      return false;
    }

    if (limit.perHour && recentHour.length >= limit.perHour) {
      this.logger.warn(`Rate limit exceeded for ${endpoint}: ${recentHour.length}/${limit.perHour} per hour`);
      return false;
    }

    return true;
  }

  recordRequest(endpoint) {
    const now = Date.now();
    
    if (!this.requests.has(endpoint)) {
      this.requests.set(endpoint, []);
    }

    const endpointRequests = this.requests.get(endpoint);
    endpointRequests.push(now);

    const oneHourAgo = now - 3600000;
    const filtered = endpointRequests.filter(time => time > oneHourAgo);
    this.requests.set(endpoint, filtered);
  }

  async waitIfNeeded(endpoint, type = 'api') {
    let attempts = 0;
    const maxAttempts = 10;

    while (!this.canMakeRequest(endpoint, type) && attempts < maxAttempts) {
      const waitTime = this.calculateWaitTime(endpoint, type);
      this.logger.info(`Rate limit reached, waiting ${waitTime}ms before next request (attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error(`Rate limit exceeded after ${maxAttempts} retry attempts`);
    }

    this.recordRequest(endpoint);
  }

  calculateWaitTime(endpoint, type = 'api') {
    const now = Date.now();
    const limit = this.limits[type] || this.limits.api;
    
    if (!this.requests.has(endpoint)) {
      return 0;
    }

    const endpointRequests = this.requests.get(endpoint);
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    
    const recentMinute = endpointRequests.filter(time => time > oneMinuteAgo);
    const recentHour = endpointRequests.filter(time => time > oneHourAgo);

    if (recentMinute.length >= (limit.perMinute || 60)) {
      const oldestMinuteRequest = Math.min(...recentMinute);
      const minuteWait = 60000 - (now - oldestMinuteRequest) + 1000;
      return Math.max(minuteWait, 0);
    }

    if (recentHour.length >= (limit.perHour || 600)) {
      const oldestHourRequest = Math.min(...recentHour);
      const hourWait = 3600000 - (now - oldestHourRequest) + 1000;
      return Math.max(hourWait, 0);
    }

    return 0;
  }

  reset() {
    this.requests.clear();
  }
}

module.exports = RateLimiter;
