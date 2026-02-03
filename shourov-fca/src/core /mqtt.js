
const mqtt = require('mqtt');
const EventEmitter = require('eventemitter3');
const { MQTT_CONFIG } = require('../utils/constants');
const { generateClientID } = require('../utils/helpers');

class MqttListener extends EventEmitter {
  constructor(httpClient, logger, options = {}) {
    super();
    this.httpClient = httpClient;
    this.logger = logger;
    this.options = options;
    this.client = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.heartbeatInterval = null;
    this.lastMessageTime = Date.now();
    this.connectionQuality = 100;
    this.messageCount = 0;
    this.reconnectDelay = 1000;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const tokens = this.httpClient.getTokens();
        const userId = tokens.userId;

        if (!userId) {
          return reject(new Error('User ID not found. Please login first.'));
        }

        const clientId = generateClientID();
        const mqttUrl = `${MQTT_CONFIG.PROTOCOL}://${MQTT_CONFIG.HOST}:${MQTT_CONFIG.PORT}`;

        this.logger.info('Connecting to MQTT...');

        const mqttOptions = {
          clientId: clientId,
          protocolId: 'MQIsdp',
          protocolVersion: 3,
          username: JSON.stringify({
            u: userId,
            s: 0,
            cp: 3,
            ecp: 10,
            chat_on: this.options.online !== false,
            fg: false,
            d: clientId,
            ct: 'websocket',
            mqtt_sid: '',
            aid: '219994525426954',
            st: [],
            pm: [],
            dc: '',
            no_auto_fg: true,
            gas: null,
            pack: []
          }),
          keepalive: MQTT_CONFIG.KEEPALIVE,
          reconnectPeriod: this.options.autoReconnect ? MQTT_CONFIG.RECONNECT_PERIOD : 0,
          connectTimeout: MQTT_CONFIG.CONNECT_TIMEOUT,
          clean: true,
          rejectUnauthorized: false
        };

        this.client = mqtt.connect(mqttUrl, mqttOptions);

        this.client.on('connect', () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.connectionQuality = 100;
          this.logger.info('✅ MQTT connected successfully');
          
          this.client.subscribe('/t_ms', (err) => {
            if (err) {
              this.logger.error('Failed to subscribe to messages topic:', err);
            } else {
              this.logger.debug('Subscribed to /t_ms topic');
            }
          });

          this.client.subscribe('/thread_typing', (err) => {
            if (err) {
              this.logger.error('Failed to subscribe to typing topic:', err);
            } else {
              this.logger.debug('Subscribed to /thread_typing topic');
            }
          });

          this.client.subscribe('/orca_presence', (err) => {
            if (err) {
              this.logger.error('Failed to subscribe to presence topic:', err);
            } else {
              this.logger.debug('Subscribed to /orca_presence topic');
            }
          });

          this.startHeartbeat();
          resolve();
        });

        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message);
        });

        this.client.on('error', (error) => {
          this.logger.error('MQTT error:', error.message);
          this.emit('error', error);
        });

        this.client.on('close', () => {
          this.connected = false;
          this.logger.warn('MQTT connection closed');
        });

        this.client.on('reconnect', () => {
          this.reconnectAttempts++;
          this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
          this.logger.info(`Reconnecting to MQTT (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.logger.error('Max reconnection attempts reached. Giving up.');
            this.disconnect();
            this.emit('max_reconnect_reached');
          }
        });

        this.client.on('offline', () => {
          this.connected = false;
          this.connectionQuality = Math.max(0, this.connectionQuality - 20);
          this.logger.warn(`MQTT offline (quality: ${this.connectionQuality}%)`);
          this.stopHeartbeat();
        });

      } catch (error) {
        this.logger.error('Failed to connect to MQTT:', error);
        reject(error);
      }
    });
  }

  handleMessage(topic, buffer) {
    try {
      this.lastMessageTime = Date.now();
      this.messageCount++;
      this.connectionQuality = Math.min(100, this.connectionQuality + 1);
      
      const message = buffer.toString();
      
      if (topic === '/t_ms') {
        const data = JSON.parse(message);
        this.emit('message', this.parseMessageEvent(data));
      } else if (topic === '/thread_typing') {
        const data = JSON.parse(message);
        this.emit('typ', data);
      } else if (topic === '/orca_presence') {
        const data = JSON.parse(message);
        this.emit('presence', data);
      }
    } catch (error) {
      this.logger.error('Failed to handle MQTT message:', error.message);
      this.connectionQuality = Math.max(0, this.connectionQuality - 5);
    }
  }

  parseMessageEvent(data) {
    try {
      if (!data || !data.type) {
        return null;
      }

      const event = {
        type: 'message',
        threadID: data.threadID || data.thread_id || null,
        messageID: data.messageID || data.message_id || null,
        senderID: data.senderID || data.author_id || null,
        body: data.body || data.message || '',
        timestamp: data.timestamp || Date.now(),
        attachments: data.attachments || [],
        mentions: data.mentions || [],
        isGroup: data.isGroup || false
      };

      return event;
    } catch (error) {
      this.logger.error('Failed to parse message event:', error);
      return null;
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime;
      const heartbeatThreshold = 5 * 60 * 1000;
      
      if (timeSinceLastMessage > heartbeatThreshold) {
        this.logger.warn(`No messages received for ${Math.floor(timeSinceLastMessage / 1000)}s`);
        this.connectionQuality = Math.max(0, this.connectionQuality - 10);
        
        if (this.connectionQuality < 30 && this.client && this.connected) {
          this.logger.warn('Connection quality poor, forcing reconnect...');
          this.forceReconnect();
        }
      }
      
      if (this.connected) {
        this.client.ping();
      }
    }, 60000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  forceReconnect() {
    if (this.client) {
      this.logger.info('Forcing MQTT reconnection...');
      this.client.reconnect();
    }
  }

  disconnect() {
    if (this.client) {
      this.logger.info('Disconnecting from MQTT...');
      this.stopHeartbeat();
      this.client.end(true);
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected;
  }

  getConnectionStats() {
    return {
      connected: this.connected,
      quality: this.connectionQuality,
      reconnectAttempts: this.reconnectAttempts,
      messageCount: this.messageCount,
      lastMessageTime: this.lastMessageTime,
      timeSinceLastMessage: Date.now() - this.lastMessageTime
    };
  }

  resetStats() {
    this.messageCount = 0;
    this.reconnectAttempts = 0;
    this.connectionQuality = 100;
  }
}

module.exports = MqttListener;
