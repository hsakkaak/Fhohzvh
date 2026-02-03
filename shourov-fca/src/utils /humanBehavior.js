const { sleep } = require('./helpers');

class HumanBehavior {
  constructor(logger, options = {}) {
    this.logger = logger;
    this.enabled = options.enableHumanBehavior !== false;
    this.typingSpeed = options.typingSpeed || { min: 50, max: 150 };
    this.readDelay = options.readDelay || { min: 1000, max: 3000 };
    this.actionDelay = options.actionDelay || { min: 500, max: 2000 };
    this.thinkDelay = options.thinkDelay || { min: 2000, max: 5000 };
  }

  getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async simulateTyping(messageLength) {
    if (!this.enabled) return;
    
    const charDelay = this.getRandomDelay(this.typingSpeed.min, this.typingSpeed.max);
    const totalDelay = charDelay * messageLength;
    const variance = this.getRandomDelay(-200, 500);
    const finalDelay = Math.max(100, totalDelay + variance);
    
    this.logger.debug(`Simulating typing for ${messageLength} chars: ${finalDelay}ms`);
    await sleep(finalDelay);
  }

  async simulateReading(messageLength = 50) {
    if (!this.enabled) return;
    
    const baseDelay = this.getRandomDelay(this.readDelay.min, this.readDelay.max);
    const lengthFactor = Math.min(messageLength / 20, 3);
    const finalDelay = Math.floor(baseDelay * lengthFactor);
    
    this.logger.debug(`Simulating reading delay: ${finalDelay}ms`);
    await sleep(finalDelay);
  }

  async simulateThinking() {
    if (!this.enabled) return;
    
    const delay = this.getRandomDelay(this.thinkDelay.min, this.thinkDelay.max);
    this.logger.debug(`Simulating thinking delay: ${delay}ms`);
    await sleep(delay);
  }

  async simulateActionDelay() {
    if (!this.enabled) return;
    
    const delay = this.getRandomDelay(this.actionDelay.min, this.actionDelay.max);
    this.logger.debug(`Simulating action delay: ${delay}ms`);
    await sleep(delay);
  }

  async beforeMessageSend(message) {
    if (!this.enabled) return;
    
    const messageText = typeof message === 'string' ? message : (message.body || '');
    const length = messageText.length;
    
    if (Math.random() < 0.7) {
      await this.simulateThinking();
    }
    
    if (length > 0) {
      await this.simulateTyping(length);
    }
    
    if (Math.random() < 0.3) {
      await sleep(this.getRandomDelay(200, 800));
    }
  }

  async beforeAction(actionType = 'default') {
    if (!this.enabled) return;
    
    const shouldDelay = Math.random() < 0.6;
    if (shouldDelay) {
      await this.simulateActionDelay();
    }
  }

  generateRandomInterval(baseInterval, variance = 0.2) {
    const varianceAmount = baseInterval * variance;
    const randomOffset = this.getRandomDelay(-varianceAmount, varianceAmount);
    return Math.max(1000, baseInterval + randomOffset);
  }

  isActiveHours() {
    const hour = new Date().getHours();
    return hour >= 6 && hour <= 23;
  }

  shouldThrottle() {
    if (!this.isActiveHours()) {
      return Math.random() < 0.7;
    }
    return Math.random() < 0.2;
  }

  async smartDelay() {
    if (!this.enabled) return;
    
    if (this.shouldThrottle()) {
      const delay = this.isActiveHours() 
        ? this.getRandomDelay(1000, 3000)
        : this.getRandomDelay(3000, 8000);
      
      this.logger.debug(`Smart throttle delay: ${delay}ms`);
      await sleep(delay);
    }
  }
}

module.exports = HumanBehavior;
