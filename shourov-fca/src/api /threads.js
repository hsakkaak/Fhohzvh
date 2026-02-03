
const { FB_URLS } = require('../utils/constants');
const { sanitizeThreadID } = require('../utils/helpers');

class Threads {
  constructor(httpClient, logger) {
    this.httpClient = httpClient;
    this.logger = logger;
  }

  async getThreadInfo(threadID) {
    try {
      const tid = sanitizeThreadID(threadID);
      this.logger.debug(`Getting thread info for: ${tid}`);

      const form = {
        thread_ids: JSON.stringify([tid])
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/mercury/thread_info.php`,
        form
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error getting thread info:', error.message);
      throw error;
    }
  }

  async getThreadHistory(threadID, amount = 20, timestamp = null) {
    try {
      const tid = sanitizeThreadID(threadID);
      this.logger.debug(`Getting thread history for: ${tid}, amount: ${amount}`);

      const form = {
        thread_id: tid,
        limit: amount,
        before: timestamp || null
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/mercury/thread_history.php`,
        form
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error getting thread history:', error.message);
      throw error;
    }
  }

  async changeThreadColor(color, threadID) {
    try {
      const tid = sanitizeThreadID(threadID);
      this.logger.debug(`Changing thread color for: ${tid} to ${color}`);

      const form = {
        thread_id: tid,
        color: color
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/messaging/save_thread_color/`,
        form
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error changing thread color:', error.message);
      throw error;
    }
  }

  async changeThreadEmoji(emoji, threadID) {
    try {
      const tid = sanitizeThreadID(threadID);
      this.logger.debug(`Changing thread emoji for: ${tid} to ${emoji}`);

      const form = {
        thread_id: tid,
        emoji: emoji
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/messaging/save_thread_emoji/`,
        form
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error changing thread emoji:', error.message);
      throw error;
    }
  }

  async changeThreadNickname(nickname, threadID, userID) {
    try {
      const tid = sanitizeThreadID(threadID);
      this.logger.debug(`Changing nickname in thread: ${tid} for user: ${userID}`);

      const form = {
        thread_id: tid,
        user_id: userID,
        nickname: nickname
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/messaging/save_thread_nickname/`,
        form
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error changing thread nickname:', error.message);
      throw error;
    }
  }

  async addUserToGroup(userID, threadID) {
    try {
      const tid = sanitizeThreadID(threadID);
      this.logger.debug(`Adding user ${userID} to thread: ${tid}`);

      const form = {
        thread_id: tid,
        user_id: userID
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/chat/add_members/`,
        form
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error adding user to group:', error.message);
      throw error;
    }
  }

  async removeUserFromGroup(userID, threadID) {
    try {
      const tid = sanitizeThreadID(threadID);
      this.logger.debug(`Removing user ${userID} from thread: ${tid}`);

      const form = {
        thread_id: tid,
        user_id: userID
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/chat/remove_members/`,
        form
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error removing user from group:', error.message);
      throw error;
    }
  }

  async muteThread(threadID, seconds = -1) {
    try {
      const tid = sanitizeThreadID(threadID);
      this.logger.debug(`Muting thread: ${tid} for ${seconds} seconds`);

      const form = {
        thread_id: tid,
        mute_settings: seconds === -1 ? '-1' : String(seconds)
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/mercury/change_mute_thread.php`,
        form
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error muting thread:', error.message);
      throw error;
    }
  }

  async unmuteThread(threadID) {
    return this.muteThread(threadID, 0);
  }
}

module.exports = Threads;
