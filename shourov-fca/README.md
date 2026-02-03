# shourov-fca

---

## ✨ Whyshourov-fca?

**shourov-fca** is the most advanced, production-ready Facebook Chat API library available. Built from the ground up with modern architecture and enterprise-grade features, it surpasses all existing solutions.

### 🏆 Key Advantages

- **🛡️ No Auto-Logout Issues** - Advanced session management with automatic token refresh
- **🔒 Suspend Protection** - Intelligent anti-ban mechanisms and rate limiting
- **⚡ Lightning Fast** - HTTP/2 support and optimized MQTT connections
- **🔄 Auto-Recovery** - Automatic reconnection and session restoration
- **📦 Rich Features** - 50+ API methods for complete Messenger control
- **🎯 Type-Safe** - Full TypeScript definitions included
- **🐛 Production Ready** - Comprehensive error handling and logging

---

## 📦 Installation

```bash
npm install shourov-fca
```

**Requirements:** Node.js v16.0.0 or higher

---

## 🚀 Quick Start

### 1. Get Your Cookies (AppState)

Use a browser extension like **C3C FbState**, **EditThisCookie**, or **Cookie-Editor** to export your Facebook cookies after logging in.

**neokex-fca supports BOTH cookie formats:**

**Browser Extension Format (Recommended):**
```json
[
  {
    "name": "c_user",
    "value": "your-user-id",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true
  },
  {
    "name": "xs",
    "value": "your-xs-token",
    "domain": ".facebook.com",
    "path": "/",
    "secure": true
  }
]
```

**Legacy Format (Also Supported):**
```json
[
  {
    "key": "c_user",
    "value": "your-user-id"
  },
  {
    "key": "xs",
    "value": "your-xs-token"
  }
]
```

### 2. Create Your First Bot

```javascript
const { login } = require('neokex-fca');
const fs = require('fs');

const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

login({ appState }, (err, api) => {
  if (err) return console.error('Login failed:', err);
  
  console.log('✅ Logged in successfully!');
  
  // Listen for messages
  api.listenMqtt((err, message) => {
    if (err) return console.error(err);
    
    // Echo bot - reply with same message
    api.sendMessage(`You said: ${message.body}`, message.threadID);
  });
});
```

---

## 🎯 Core Features

### Authentication & Session Management
- ✅ Cookie-based authentication (AppState)
- ✅ Automatic token refresh (fb_dtsg, jazoest, lsd)
- ✅ Session persistence and recovery
- ✅ Account status detection (suspended, checkpoint, locked)
- ✅ Multi-account support

### Messaging
- ✅ Send/receive text messages
- ✅ Send attachments (images, videos, files, audio)
- ✅ Send stickers and emojis
- ✅ Edit and unsend messages
- ✅ Reply to messages
- ✅ React to messages
- ✅ Forward messages

### Real-time Events
- ✅ MQTT-based message listener
- ✅ Typing indicators
- ✅ Presence updates
- ✅ Read receipts
- ✅ Message reactions
- ✅ Thread events (add/remove members, name changes)

### Thread Management
- ✅ Get thread info
- ✅ Load message history
- ✅ Search threads
- ✅ Pin/unpin messages
- ✅ Mute/unmute threads
- ✅ Change thread colors and emojis

### User Operations
- ✅ Get user information
- ✅ Search users
- ✅ Send friend requests
- ✅ Block/unblock users
- ✅ Update presence

### Advanced Features
- ✅ Proxy support with rotation
- ✅ Rate limiting and anti-ban protection
- ✅ HTTP/2 support
- ✅ Retry logic with exponential backoff
- ✅ Comprehensive logging system
- ✅ Event emitter architecture
- ✅ Command handler framework

---

## 📚 API Documentation

### Login Options

```javascript
const options = {
  logLevel: 'info',        // 'silent' | 'error' | 'warn' | 'info' | 'debug'
  selfListen: false,       // Listen to your own messages
  listenEvents: true,      // Listen to thread events
  updatePresence: true,    // Auto-update presence
  online: true,            // Set online status
  autoReconnect: true,     // Auto-reconnect on disconnect
  reconnectDelay: 3000,    // Reconnect delay in ms
  userAgent: null,         // Custom user agent (auto-generated if null)
  proxy: null              // Proxy URL (http://user:pass@host:port)
};

login(credentials, options, callback);
```

### Messaging API

```javascript
// Send text message
api.sendMessage('Hello!', threadID);

// Send with attachment
api.sendMessage({
  body: 'Check this out!',
  attachment: fs.createReadStream('image.jpg')
}, threadID);

// Send sticker
api.sendMessage({ sticker: 'sticker_id' }, threadID);

// Reply to message
api.sendMessage('Reply text', threadID, messageID);

// Edit message
api.editMessage('New text', messageID);

// Unsend message
api.unsendMessage(messageID);

// React to message
api.setMessageReaction('❤️', messageID);
```

### Listening

```javascript
// MQTT listener (recommended)
api.listenMqtt((err, event) => {
  if (err) return console.error(err);
  
  switch(event.type) {
    case 'message':
      console.log('New message:', event.body);
      break;
    case 'event':
      console.log('Thread event:', event);
      break;
    case 'typ':
      console.log('Typing indicator');
      break;
  }
});

// Stop listening
const stopListening = api.listenMqtt(callback);
stopListening();
```

### Thread Operations

```javascript
// Get thread info
api.getThreadInfo(threadID, (err, info) => {
  console.log(info);
});

// Get message history
api.getThreadHistory(threadID, 50, null, (err, history) => {
  console.log(history);
});

// Change thread color
api.changeThreadColor('#ff0000', threadID);

// Change thread emoji
api.changeThreadEmoji('🔥', threadID);

// Add user to thread
api.addUserToGroup(userID, threadID);

// Remove user from thread
api.removeUserFromGroup(userID, threadID);
```

### User Operations

```javascript
// Get user info
api.getUserInfo(userID, (err, info) => {
  console.log(info);
});

// Send typing indicator
api.sendTypingIndicator(threadID);

// Mark as read
api.markAsRead(threadID);

// Set online/offline
api.setOptions({ online: true });
```

---

## 🔧 Advanced Usage

### Command Handler Example

```javascript
const commands = new Map();

// Register command
commands.set('ping', {
  description: 'Test bot response',
  execute: (api, event) => {
    api.sendMessage('🏓 Pong!', event.threadID);
  }
});

api.listenMqtt((err, event) => {
  if (err || event.type !== 'message') return;
  
  const args = event.body.split(' ');
  const cmd = args[0].toLowerCase();
  
  if (commands.has(cmd)) {
    commands.get(cmd).execute(api, event);
  }
});
```

### Proxy Support

```javascript
login({ appState }, {
  proxy: 'http://username:password@proxy.com:8080'
}, callback);
```

### Error Handling

```javascript
api.listenMqtt((err, event) => {
  if (err) {
    if (err.error === 'Connection closed') {
      console.log('Reconnecting...');
      // Auto-reconnect is enabled by default
    }
    return;
  }
  // Handle event
});
```

---

## 🛡️ Advanced Anti-Ban Protection

**shourov-fca** includes the most sophisticated anti-ban system of any Facebook Chat API. Our multi-layered protection ensures your accounts stay safe while maintaining high performance.

### 🔐 Built-in Protection Features

#### 1. **Human Behavior Simulation**
Mimics real human typing and interaction patterns:
- Realistic typing delays based on message length
- Random thinking pauses before responding
- Natural action delays between operations
- Customizable speed profiles

```javascript
const api = await login({ appState }, {
  enableHumanBehavior: true,
  typingSpeed: { min: 50, max: 150 },     // ms per character
  readDelay: { min: 1000, max: 3000 },     // Reading time
  actionDelay: { min: 500, max: 2000 },    // Between actions
  thinkDelay: { min: 2000, max: 5000 }     // Thinking time
});
```

#### 2. **Device Fingerprint Persistence**
Maintains consistent device identity across sessions:
- Persistent device IDs and machine fingerprints
- Consistent browser and screen fingerprints
- Automatic fingerprint storage and rotation
- Reduces "new device" detection triggers

```javascript
const api = await login({ appState }, {
  fingerprintPath: '.my-device-fingerprint.json'
});
```

#### 3. **Activity Pattern Management**
Intelligent activity monitoring and throttling:
- Hourly and daily message limits
- Burst detection and cooldown
- Active hours awareness (6 AM - 11 PM)
- Multiple activity profiles

```javascript
const api = await login({ appState }, {
  enableActivityPatterns: true,
  activityProfile: 'balanced',  // 'conservative', 'balanced', 'aggressive'
  dailyMessageLimit: 500
});

// Change profile during runtime
api.setActivityProfile('conservative');

// Monitor your activity
const stats = api.getAntiBanStats();
console.log(`Messages today: ${stats.activity.messagesThisDay}/${stats.activity.limits.daily}`);
console.log(`Account health: ${stats.accountHealth ? 'Healthy' : 'At Risk'}`);
```

**Activity Profiles:**
- **Conservative**: 15 msgs/hour, max 3 burst, frequent breaks
- **Balanced**: 25 msgs/hour, max 5 burst, moderate breaks (default)
- **Aggressive**: 40 msgs/hour, max 8 burst, minimal breaks

#### 4. **Checkpoint Detection System**
Real-time detection of Facebook security challenges:
- HTML structure analysis for checkpoint pages
- Response pattern matching
- Cookie-based verification detection
- Automatic alerts and recommendations

```javascript
// Automatic checkpoint detection in all requests
const stats = api.getAntiBanStats();

if (!stats.accountHealth) {
  console.log('⚠️ Checkpoint detected!');
  console.log(`Total detections: ${stats.checkpoint.totalDetections}`);
  // Reduce activity or verify account manually
}
```

#### 5. **Enhanced MQTT Stability**
Rock-solid real-time connection with:
- Intelligent heartbeat monitoring
- Connection quality tracking (0-100%)
- Exponential backoff reconnection
- Automatic poor-connection recovery

```javascript
// Monitor connection quality
const stats = api.getAntiBanStats();
if (stats.mqtt) {
  console.log(`Connection quality: ${stats.mqtt.quality}%`);
  console.log(`Messages received: ${stats.mqtt.messageCount}`);
}
```

#### 6. **Smart Request Header Randomization**
Advanced browser fingerprint simulation:
- Randomized Accept-Language headers
- Consistent sec-ch-ua headers per device
- Platform-specific header generation
- Viewport and DPR headers

#### 7. **Advanced Rate Limiting**
Multi-tier protection against API limits:
- Per-endpoint rate tracking
- Type-based limits (message, API, typing)
- Automatic throttling and waiting
- Configurable retry logic

### 📊 Monitoring Your Account Health

```javascript
const stats = api.getAntiBanStats();

console.log('Activity Stats:', {
  messagesThisHour: stats.activity.messagesThisHour,
  messagesThisDay: stats.activity.messagesThisDay,
  hourlyUsage: `${stats.activity.usage.hourlyPercent}%`,
  dailyUsage: `${stats.activity.usage.dailyPercent}%`
});

console.log('Security Status:', {
  accountHealthy: stats.accountHealth,
  checkpointDetections: stats.checkpoint.totalDetections,
  mqttQuality: stats.mqtt?.quality
});

console.log('Device Info:', {
  deviceId: stats.device.deviceId,
  browser: stats.device.browser.name,
  platform: stats.device.platform
});
```

### ⚙️ Configuration Examples

**Maximum Protection (Conservative):**
```javascript
const api = await login({ appState }, {
  enableHumanBehavior: true,
  enableActivityPatterns: true,
  activityProfile: 'conservative',
  dailyMessageLimit: 300,
  typingSpeed: { min: 80, max: 200 },
  thinkDelay: { min: 3000, max: 7000 },
  autoReconnect: true
});
```

**Balanced Performance:**
```javascript
const api = await login({ appState }, {
  enableHumanBehavior: true,
  enableActivityPatterns: true,
  activityProfile: 'balanced',
  dailyMessageLimit: 500
});
```

**High Volume (Use with caution):**
```javascript
const api = await login({ appState }, {
  enableActivityPatterns: true,
  activityProfile: 'aggressive',
  dailyMessageLimit: 1000,
  enableHumanBehavior: false  // Disable delays for speed
});
```

### 🎯 Best Practices

1. ✅ **Always enable human behavior** for new accounts
2. ✅ **Start with conservative profile** and gradually increase
3. ✅ **Monitor stats regularly** using `getAntiBanStats()`
4. ✅ **Use device fingerprints** for consistent identity
5. ✅ **Respect daily limits** - don't override protection
6. ✅ **Watch for checkpoints** - stop immediately if detected
7. ✅ **Use proxies** for multiple accounts
8. ✅ **Avoid mass messaging** strangers or spam patterns

### 🚨 Warning Signs

If you see these, reduce activity immediately:
- `accountHealth: false`
- Checkpoint detections > 0
- MQTT quality < 50%
- Daily usage > 90%

---

## 📊 Comparison with Other Libraries

| Feature | shourov-fca | ws3-fca | fca-unofficial |
|---------|-----------|---------|----------------|
| No Auto-Logout | ✅ | ⚠️ | ❌ |
| Suspend Protection | ✅ | ⚠️ | ❌ |
| HTTP/2 Support | ✅ | ❌ | ❌ |
| TypeScript Definitions | ✅ | ❌ | ❌ |
| Auto Token Refresh | ✅ | ✅ | ⚠️ |
| Proxy Support | ✅ | ✅ | ✅ |
| MQTT Listener | ✅ | ✅ | ✅ |
| Active Maintenance | ✅ | ✅ | ❌ |
| Command Framework | ✅ | ⚠️ | ❌ |

---

## ⚠️ Important Notes

- This library is **unofficial** and violates Facebook's Terms of Service
- Use at your own risk - your account may be banned
- Not recommended for spamming or malicious activities
- For legitimate bot needs, use Facebook's official Messenger Platform

---

## 📝 License

MIT License - feel free to use, modify, and distribute

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 💬 Support

- 📧 Open an issue on GitHub
- 📖 Read the documentation
- ⭐ Star the repo if you find it useful!

---
