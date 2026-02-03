const FormData = require('form-data');
const fs = require('fs');
const { FB_URLS } = require('../utils/constants');
const { generateOfflineThreadingID, sanitizeThreadID, sanitizeMessageID } = require('../utils/helpers');

class Messaging {
  constructor(httpClient, logger, modules = {}) {
    this.httpClient = httpClient;
    this.logger = logger;
    this.humanBehavior = modules.humanBehavior;
    this.activityManager = modules.activityManager;
  }

  async sendMessage(message, threadID, messageID = null) {
    try {
      if (this.activityManager) {
        await this.activityManager.checkAndWait();
      }

      if (this.humanBehavior) {
        await this.humanBehavior.beforeMessageSend(message);
      }

      const tid = sanitizeThreadID(threadID);
      this.logger.debug(`Sending message to thread: ${tid}`);

      let msgBody = '';
      let attachments = [];
      let stickerId = null;
      let url = null;

      if (typeof message === 'string') {
        msgBody = message;
      } else if (typeof message === 'object') {
        msgBody = message.body || '';
        if (message.attachment) {
          attachments = Array.isArray(message.attachment) ? message.attachment : [message.attachment];
        }
        stickerId = message.sticker || null;
        url = message.url || null;
      }

      const form = {
        message_batch: JSON.stringify([{
          action_type: 'ma-type:user-generated-message',
          author: `fbid:${this.httpClient.getUserId()}`,
          timestamp: Date.now(),
          timestamp_absolute: 'Today',
          timestamp_relative: Date.now(),
          timestamp_time_passed: '0',
          is_unread: false,
          is_cleared: false,
          is_forward: false,
          is_filtered_content: false,
          is_filtered_content_bh: false,
          is_filtered_content_account: false,
          is_spoof_warning: false,
          source: 'source:chat:web',
          'source_tags[0]': 'source:chat',
          body: msgBody,
          html_body: false,
          ui_push_phase: 'V3',
          status: '0',
          offline_threading_id: generateOfflineThreadingID().toString(),
          message_id: generateOfflineThreadingID().toString(),
          threading_id: generateOfflineThreadingID().toString(),
          ephemeral_ttl_mode: '0',
          manual_retry_cnt: '0',
          signatureID: Math.floor(Math.random() * 2147483648).toString(),
          has_attachment: attachments.length > 0,
          sticker_id: stickerId,
          replied_to_message_id: messageID
        }]),
        to: tid,
        client: 'mercury'
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/messaging/send/`,
        form
      );

      if (response.status === 200) {
        this.logger.debug('Message sent successfully');
        
        if (this.activityManager) {
          this.activityManager.recordAction();
        }
        
        return { success: true, threadID: tid };
      } else {
        this.logger.error('Failed to send message:', response.statusText);
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error sending message:', error.message);
      throw error;
    }
  }

  async editMessage(newMessage, messageID) {
    try {
      const mid = sanitizeMessageID(messageID);
      this.logger.debug(`Editing message: ${mid}`);

      const form = {
        message_id: mid,
        text: newMessage
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/messaging/edit_message/`,
        form
      );

      if (response.status === 200) {
        this.logger.debug('Message edited successfully');
        return { success: true, messageID: mid };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error editing message:', error.message);
      throw error;
    }
  }

  async unsendMessage(messageID) {
    try {
      const mid = sanitizeMessageID(messageID);
      this.logger.debug(`Unsending message: ${mid}`);

      const form = {
        message_id: mid
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/messaging/unsend_message/`,
        form
      );

      if (response.status === 200) {
        this.logger.debug('Message unsent successfully');
        return { success: true, messageID: mid };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error unsending message:', error.message);
      throw error;
    }
  }

  async setMessageReaction(reaction, messageID) {
    try {
      const mid = sanitizeMessageID(messageID);
      this.logger.debug(`Reacting to message: ${mid} with ${reaction}`);

      const form = {
        message_id: mid,
        reaction: reaction || '',
        action: reaction ? 'ADD_REACTION' : 'REMOVE_REACTION'
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/messaging/reaction/`,
        form
      );

      if (response.status === 200) {
        this.logger.debug('Reaction set successfully');
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error setting reaction:', error.message);
      throw error;
    }
  }

  async sendTypingIndicator(threadID, isTyping = true) {
    try {
      if (this.humanBehavior && isTyping) {
        await this.humanBehavior.simulateActionDelay();
      }

      const tid = sanitizeThreadID(threadID);

      const form = {
        thread: tid,
        typ: isTyping ? 1 : 0,
        to: tid,
        source: 'mercury-chat'
      };

      await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/messaging/typ.php`,
        form
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Error sending typing indicator:', error.message);
      throw error;
    }
  }

  async markAsRead(threadID) {
    try {
      const tid = sanitizeThreadID(threadID);

      const form = {
        ids: `[${tid}]`,
        shouldMakeReadOnly: false,
        watermarkTimestamp: Date.now()
      };

      await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/mercury/change_read_status.php`,
        form
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Error marking as read:', error.message);
      throw error;
    }
  }

  async markAsSeen(threadID) {
    try {
      const tid = sanitizeThreadID(threadID);

      const form = {
        ids: `[${tid}]`,
        shouldMakeReadOnly: false,
        watermarkTimestamp: Date.now()
      };

      await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/mercury/mark_seen.php`,
        form
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Error marking as seen:', error.message);
      throw error;
    }
  }
}

module.exports = Messaging;
