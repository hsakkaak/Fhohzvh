module.exports = {
  FB_URLS: {
    MOBILE: 'https://m.facebook.com',
    MBASIC: 'https://mbasic.facebook.com',
    WWW: 'https://www.facebook.com',
    MESSENGER: 'https://www.messenger.com',
    GRAPH: 'https://graph.facebook.com',
    API: 'https://api.facebook.com',
    UPLOAD: 'https://upload.facebook.com'
  },

  FB_ENDPOINTS: {
    LOGIN: '/login.php',
    CHECKPOINT: '/checkpoint/',
    MESSAGES: '/messages',
    SEND_MESSAGE: '/messaging/send/',
    THREAD_INFO: '/messaging/get_thread_info/',
    THREAD_LIST: '/chat/user_info_all',
    USER_INFO: '/chat/user_info/',
    SEARCH: '/search/top/',
    PRESENCE: '/ajax/mercury/change_presence.php',
    TYPING: '/messaging/typ/',
    READ_RECEIPT: '/ajax/mercury/change_read_status.php',
    MARK_SEEN: '/ajax/mercury/mark_seen.php'
  },

  MQTT_CONFIG: {
    HOST: 'edge-chat.facebook.com',
    PORT: 443,
    PROTOCOL: 'mqtts',
    KEEPALIVE: 60,
    RECONNECT_PERIOD: 3000,
    CONNECT_TIMEOUT: 30000
  },

  USER_AGENTS: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ],

  ERROR_CODES: {
    LOGIN_FAILED: 'LOGIN_FAILED',
    CHECKPOINT_REQUIRED: 'CHECKPOINT_REQUIRED',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    INVALID_APPSTATE: 'INVALID_APPSTATE',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    MQTT_ERROR: 'MQTT_ERROR',
    RATE_LIMIT: 'RATE_LIMIT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  },

  MESSAGE_TYPES: {
    TEXT: 'text',
    STICKER: 'sticker',
    FILE: 'file',
    PHOTO: 'photo',
    VIDEO: 'video',
    AUDIO: 'audio',
    EMOJI: 'emoji',
    SHARE: 'share'
  },

  EVENT_TYPES: {
    MESSAGE: 'message',
    MESSAGE_REPLY: 'message_reply',
    MESSAGE_REACTION: 'message_reaction',
    MESSAGE_UNSEND: 'message_unsend',
    EVENT: 'event',
    TYP: 'typ',
    PRESENCE: 'presence',
    READ_RECEIPT: 'read_receipt'
  },

  DEFAULT_OPTIONS: {
    logLevel: 'info',
    selfListen: false,
    listenEvents: true,
    updatePresence: true,
    online: true,
    autoReconnect: true,
    reconnectDelay: 3000,
    maxRetries: 5,
    retryDelay: 1000,
    userAgent: null,
    proxy: null,
    forceLogin: false,
    pauseLog: false
  },

  RATE_LIMITS: {
    MESSAGE_PER_MINUTE: 20,
    MESSAGE_PER_HOUR: 200,
    FRIEND_REQUEST_PER_DAY: 50,
    TYPING_DELAY: 1000
  }
};
