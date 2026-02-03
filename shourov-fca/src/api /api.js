const EventEmitter = require('eventemitter3');
const HttpClient = require('../core/httpClient');
const Auth = require('../core/auth');
const MqttListener = require('../core/mqtt');
const Messaging = require('./messaging');
const Threads = require('./threads');
const Users = require('./users');
const Logger = require('../utils/logger');
const HumanBehavior = require('../utils/humanBehavior');
const DeviceFingerprint = require('../utils/deviceFingerprint');
const ActivityManager = require('../utils/activityManager');
const CheckpointDetector = require('../utils/checkpointDetector');
const { DEFAULT_OPTIONS } = require('../utils/constants');
const { generateUserAgent } = require('../utils/helpers');

class NeokexAPI extends EventEmitter {
  constructor(appState, options = {}) {
    super();
    
    this.appState = appState;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.logger = new Logger({ logLevel: this.options.logLevel });
    
    this.deviceFingerprint = new DeviceFingerprint(this.logger, this.options);
    this.humanBehavior = new HumanBehavior(this.logger, this.options);
    this.activityManager = new ActivityManager(this.logger, this.options);
    this.checkpointDetector = new CheckpointDetector(this.logger);
    
    if (!this.options.userAgent) {
      this.options.userAgent = generateUserAgent();
    }
    
    this.httpClient = new HttpClient(this.appState, this.options, this.logger, {
      deviceFingerprint: this.deviceFingerprint,
      checkpointDetector: this.checkpointDetector
    });
    this.auth = new Auth(this.httpClient, this.logger);
    this.messaging = new Messaging(this.httpClient, this.logger, {
      humanBehavior: this.humanBehavior,
      activityManager: this.activityManager
    });
    this.threads = new Threads(this.httpClient, this.logger);
    this.users = new Users(this.httpClient, this.logger);
    this.mqtt = null;
    
    this.currentUserID = null;
  }

  async initialize() {
    try {
      this.logger.info('🚀 Initializing shourov-fca...');
      
      const loginResult = await this.auth.login(this.appState);
      this.currentUserID = loginResult.userId;
      
      if (this.options.autoReconnect) {
        this.setupTokenRefresh();
      }
      
      return loginResult;
    } catch (error) {
      this.logger.error('Initialization failed:', error.message);
      throw error;
    }
  }

  setupTokenRefresh() {
    setInterval(async () => {
      try {
        await this.auth.refreshTokens();
        this.logger.debug('Tokens refreshed automatically');
      } catch (error) {
        this.logger.error('Auto token refresh failed:', error.message);
      }
    }, 6 * 60 * 60 * 1000);
  }

  async sendMessage(message, threadID, messageID = null) {
    return this.messaging.sendMessage(message, threadID, messageID);
  }

  async editMessage(newMessage, messageID) {
    return this.messaging.editMessage(newMessage, messageID);
  }

  async unsendMessage(messageID) {
    return this.messaging.unsendMessage(messageID);
  }

  async setMessageReaction(reaction, messageID) {
    return this.messaging.setMessageReaction(reaction, messageID);
  }

  async sendTypingIndicator(threadID, isTyping = true) {
    return this.messaging.sendTypingIndicator(threadID, isTyping);
  }

  async markAsRead(threadID) {
    return this.messaging.markAsRead(threadID);
  }

  async markAsSeen(threadID) {
    return this.messaging.markAsSeen(threadID);
  }

  async getThreadInfo(threadID) {
    return this.threads.getThreadInfo(threadID);
  }

  async getThreadHistory(threadID, amount = 20, timestamp = null) {
    return this.threads.getThreadHistory(threadID, amount, timestamp);
  }

  async changeThreadColor(color, threadID) {
    return this.threads.changeThreadColor(color, threadID);
  }

  async changeThreadEmoji(emoji, threadID) {
    return this.threads.changeThreadEmoji(emoji, threadID);
  }

  async changeThreadNickname(nickname, threadID, userID) {
    return this.threads.changeThreadNickname(nickname, threadID, userID);
  }

  async addUserToGroup(userID, threadID) {
    return this.threads.addUserToGroup(userID, threadID);
  }

  async removeUserFromGroup(userID, threadID) {
    return this.threads.removeUserFromGroup(userID, threadID);
  }

  async muteThread(threadID, seconds = -1) {
    return this.threads.muteThread(threadID, seconds);
  }

  async unmuteThread(threadID) {
    return this.threads.unmuteThread(threadID);
  }

  async getUserInfo(userID) {
    return this.users.getUserInfo(userID);
  }

  async searchUsers(searchText, limit = 10) {
    return this.users.searchUsers(searchText, limit);
  }

  async getFriendsList() {
    return this.users.getFriendsList();
  }

  async blockUser(userID) {
    return this.users.blockUser(userID);
  }

  async unblockUser(userID) {
    return this.users.unblockUser(userID);
  }

  async changePresence(online = true) {
    return this.users.changePresence(online);
  }

  listenMqtt(callback) {
    if (!this.mqtt) {
      this.mqtt = new MqttListener(this.httpClient, this.logger, this.options);
      
      this.mqtt.on('message', (event) => {
        if (!this.options.selfListen && event.senderID === this.currentUserID) {
          return;
        }
        callback(null, event);
      });

      this.mqtt.on('typ', (event) => {
        if (this.options.listenEvents) {
          callback(null, { ...event, type: 'typ' });
        }
      });

      this.mqtt.on('presence', (event) => {
        if (this.options.listenEvents) {
          callback(null, { ...event, type: 'presence' });
        }
      });

      this.mqtt.on('error', (error) => {
        callback(error, null);
      });

      this.mqtt.connect().catch((error) => {
        callback(error, null);
      });
    }

    return () => {
      if (this.mqtt) {
        this.mqtt.disconnect();
        this.mqtt = null;
      }
    };
  }

  getCurrentUserID() {
    return this.currentUserID;
  }

  getAppState() {
    return this.appState;
  }

  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    if (newOptions.online !== undefined && this.mqtt) {
      this.mqtt.disconnect();
      this.mqtt = null;
    }
  }

  getAntiBanStats() {
    return {
      activity: this.activityManager.getStats(),
      checkpoint: this.checkpointDetector.getDetectionStats(),
      device: this.deviceFingerprint.getAll(),
      mqtt: this.mqtt ? this.mqtt.getConnectionStats() : null,
      accountHealth: this.checkpointDetector.isAccountHealthy()
    };
  }

  setActivityProfile(profileName) {
    this.activityManager.setProfile(profileName);
    this.logger.info(`Activity profile set to: ${profileName}`);
  }

  logout() {
    if (this.mqtt) {
      this.mqtt.disconnect();
    }
    this.logger.info('Logged out successfully');
  }
}

module.exports = NeokexAPI;
