const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class DeviceFingerprint {
  constructor(logger, options = {}) {
    this.logger = logger;
    this.fingerprintPath = options.fingerprintPath || '.device_fingerprint.json';
    this.fingerprint = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.fingerprintPath)) {
        const data = fs.readFileSync(this.fingerprintPath, 'utf8');
        this.fingerprint = JSON.parse(data);
        this.logger.debug('Device fingerprint loaded from file');
      } else {
        this.fingerprint = this.generate();
        this.save();
        this.logger.debug('New device fingerprint generated and saved');
      }
    } catch (error) {
      this.logger.warn('Failed to load fingerprint, generating new one:', error.message);
      this.fingerprint = this.generate();
      this.save();
    }
  }

  generate() {
    const now = Date.now();
    
    return {
      deviceId: crypto.randomBytes(16).toString('hex'),
      clientId: crypto.randomBytes(16).toString('hex'),
      machineId: this.generateMachineId(),
      sessionId: this.generateSessionId(),
      createdAt: now,
      lastUsed: now,
      browser: this.generateBrowserFingerprint(),
      screen: this.generateScreenFingerprint(),
      timezone: this.getTimezone(),
      language: 'en-US',
      platform: this.getPlatform()
    };
  }

  generateMachineId() {
    const components = [
      crypto.randomBytes(4).toString('hex'),
      crypto.randomBytes(2).toString('hex'),
      crypto.randomBytes(2).toString('hex'),
      crypto.randomBytes(2).toString('hex'),
      crypto.randomBytes(6).toString('hex')
    ];
    return components.join('-');
  }

  generateSessionId() {
    return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  generateBrowserFingerprint() {
    const browsers = [
      { name: 'Chrome', version: this.randomVersion(120, 130) },
      { name: 'Firefox', version: this.randomVersion(120, 125) },
      { name: 'Safari', version: this.randomVersion(17, 18) },
      { name: 'Edge', version: this.randomVersion(120, 130) }
    ];
    
    return browsers[Math.floor(Math.random() * browsers.length)];
  }

  generateScreenFingerprint() {
    const resolutions = [
      { width: 1920, height: 1080, colorDepth: 24 },
      { width: 1366, height: 768, colorDepth: 24 },
      { width: 1536, height: 864, colorDepth: 24 },
      { width: 2560, height: 1440, colorDepth: 24 },
      { width: 1440, height: 900, colorDepth: 24 }
    ];
    
    return resolutions[Math.floor(Math.random() * resolutions.length)];
  }

  randomVersion(min, max) {
    const major = Math.floor(Math.random() * (max - min + 1)) + min;
    const minor = Math.floor(Math.random() * 10);
    const patch = Math.floor(Math.random() * 100);
    return `${major}.${minor}.${patch}`;
  }

  getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
    } catch {
      return 'America/New_York';
    }
  }

  getPlatform() {
    const platforms = ['Win32', 'MacIntel', 'Linux x86_64'];
    return platforms[Math.floor(Math.random() * platforms.length)];
  }

  save() {
    try {
      this.fingerprint.lastUsed = Date.now();
      fs.writeFileSync(this.fingerprintPath, JSON.stringify(this.fingerprint, null, 2));
      this.logger.debug('Device fingerprint saved');
    } catch (error) {
      this.logger.error('Failed to save fingerprint:', error.message);
    }
  }

  getDeviceId() {
    return this.fingerprint.deviceId;
  }

  getClientId() {
    return this.fingerprint.clientId;
  }

  getMachineId() {
    return this.fingerprint.machineId;
  }

  getSessionId() {
    return this.fingerprint.sessionId;
  }

  getBrowserInfo() {
    return this.fingerprint.browser;
  }

  getScreenInfo() {
    return this.fingerprint.screen;
  }

  getAll() {
    return { ...this.fingerprint };
  }

  refreshSession() {
    this.fingerprint.sessionId = this.generateSessionId();
    this.save();
    this.logger.debug('Session ID refreshed');
  }

  updateLastUsed() {
    this.fingerprint.lastUsed = Date.now();
    this.save();
  }
}

module.exports = DeviceFingerprint;
