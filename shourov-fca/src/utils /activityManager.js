
const { sleep } = require('./helpers');

class ActivityManager {
  constructor(logger, options = {}) {
    this.logger = logger;
    this.enabled = options.enableActivityPatterns !== false;
    this.activityProfile = options.activityProfile || 'balanced';
    this.dailyMessageLimit = options.dailyMessageLimit || 500;
    this.sessionDuration = options.sessionDuration || { min: 30, max: 180 };
    
    this.stats = {
      messagesThisHour: 0,
      messagesThisDay: 0,
      sessionStartTime: Date.now(),
      lastResetHour: new Date().getHours(),
      lastResetDay: new Date().getDate(),
      consecutiveActions: 0,
      lastActionTime: 0
    };
    
    this.activityProfiles = {
      conservative: { hourlyLimit: 15, burstLimit: 3, restProbability: 0.4 },
      balanced: { hourlyLimit: 25, burstLimit: 5, restProbability: 0.25 },
      aggressive: { hourlyLimit: 40, burstLimit: 8, restProbability: 0.15 }
    };
    
    this.currentProfile = this.activityProfiles[this.activityProfile] || this.activityProfiles.balanced;
  }

  resetHourlyStats() {
    const currentHour = new Date().getHours();
    if (currentHour !== this.stats.lastResetHour) {
      this.stats.messagesThisHour = 0;
      this.stats.lastResetHour = currentHour;
      this.logger.debug('Hourly stats reset');
    }
  }

  resetDailyStats() {
    const currentDay = new Date().getDate();
    if (currentDay !== this.stats.lastResetDay) {
      this.stats.messagesThisDay = 0;
      this.stats.lastResetDay = currentDay;
      this.logger.info('Daily stats reset - new day');
    }
  }

  recordAction() {
    this.resetHourlyStats();
    this.resetDailyStats();
    
    this.stats.messagesThisHour++;
    this.stats.messagesThisDay++;
    
    const now = Date.now();
    const timeSinceLastAction = now - this.stats.lastActionTime;
    
    if (timeSinceLastAction < 2000) {
      this.stats.consecutiveActions++;
    } else {
      this.stats.consecutiveActions = 1;
    }
    
    this.stats.lastActionTime = now;
  }

  async checkAndWait() {
    if (!this.enabled) return true;
    
    this.resetHourlyStats();
    this.resetDailyStats();
    
    if (this.stats.messagesThisDay >= this.dailyMessageLimit) {
      this.logger.warn(`Daily limit reached (${this.dailyMessageLimit}). Throttling heavily.`);
      await sleep(60000);
      return false;
    }
    
    if (this.stats.messagesThisHour >= this.currentProfile.hourlyLimit) {
      const waitTime = this.getRandomDelay(30000, 120000);
      this.logger.warn(`Hourly limit reached. Waiting ${waitTime}ms before continuing.`);
      await sleep(waitTime);
    }
    
    if (this.stats.consecutiveActions >= this.currentProfile.burstLimit) {
      const burstDelay = this.getRandomDelay(3000, 8000);
      this.logger.debug(`Burst limit reached. Cooling down for ${burstDelay}ms`);
      await sleep(burstDelay);
      this.stats.consecutiveActions = 0;
    }
    
    if (Math.random() < this.currentProfile.restProbability) {
      await this.takeBreak();
    }
    
    if (!this.isActiveHours()) {
      await this.nighttimeThrottle();
    }
    
    return true;
  }

  async takeBreak() {
    const breakDuration = this.getRandomDelay(5000, 15000);
    this.logger.debug(`Taking a random break for ${breakDuration}ms (human-like behavior)`);
    await sleep(breakDuration);
  }

  async nighttimeThrottle() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      const nightDelay = this.getRandomDelay(10000, 30000);
      this.logger.debug(`Nighttime activity - adding extra delay: ${nightDelay}ms`);
      await sleep(nightDelay);
    }
  }

  isActiveHours() {
    const hour = new Date().getHours();
    return hour >= 6 && hour <= 23;
  }

  getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  shouldAllowAction() {
    this.resetHourlyStats();
    this.resetDailyStats();
    
    if (this.stats.messagesThisDay >= this.dailyMessageLimit) {
      return false;
    }
    
    if (this.stats.messagesThisHour >= this.currentProfile.hourlyLimit * 1.2) {
      return false;
    }
    
    return true;
  }

  getStats() {
    this.resetHourlyStats();
    this.resetDailyStats();
    
    return {
      ...this.stats,
      profile: this.activityProfile,
      limits: {
        hourly: this.currentProfile.hourlyLimit,
        daily: this.dailyMessageLimit
      },
      usage: {
        hourlyPercent: Math.round((this.stats.messagesThisHour / this.currentProfile.hourlyLimit) * 100),
        dailyPercent: Math.round((this.stats.messagesThisDay / this.dailyMessageLimit) * 100)
      }
    };
  }

  setProfile(profileName) {
    if (this.activityProfiles[profileName]) {
      this.activityProfile = profileName;
      this.currentProfile = this.activityProfiles[profileName];
      this.logger.info(`Activity profile changed to: ${profileName}`);
    }
  }

  isSessionHealthy() {
    const sessionAge = Date.now() - this.stats.sessionStartTime;
    const maxDuration = this.sessionDuration.max * 60 * 1000;
    
    if (sessionAge > maxDuration) {
      this.logger.warn('Session duration exceeded recommended time');
      return false;
    }
    
    return true;
  }
}

module.exports = ActivityManager;
