const { FB_URLS } = require('../utils/constants');

class Users {
  constructor(httpClient, logger) {
    this.httpClient = httpClient;
    this.logger = logger;
  }

  async getUserInfo(userID) {
    try {
      const ids = Array.isArray(userID) ? userID : [userID];
      this.logger.debug(`Getting user info for: ${ids.join(', ')}`);

      const form = {
        ids: JSON.stringify(ids)
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/chat/user_info/`,
        form
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error getting user info:', error.message);
      throw error;
    }
  }

  async searchUsers(searchText, limit = 10) {
    try {
      this.logger.debug(`Searching users: ${searchText}`);

      const form = {
        value: searchText,
        limit: limit
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/typeahead/search.php`,
        form
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error searching users:', error.message);
      throw error;
    }
  }

  async getFriendsList() {
    try {
      this.logger.debug('Getting friends list');

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/chat/user_info_all`,
        {}
      );

      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error getting friends list:', error.message);
      throw error;
    }
  }

  async blockUser(userID) {
    try {
      this.logger.debug(`Blocking user: ${userID}`);

      const form = {
        fbid: userID
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/profile/block_user.php`,
        form
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error blocking user:', error.message);
      throw error;
    }
  }

  async unblockUser(userID) {
    try {
      this.logger.debug(`Unblocking user: ${userID}`);

      const form = {
        fbid: userID
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/profile/unblock_user.php`,
        form
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error unblocking user:', error.message);
      throw error;
    }
  }

  async changePresence(online = true) {
    try {
      this.logger.debug(`Changing presence to: ${online ? 'online' : 'offline'}`);

      const form = {
        make_user_available_when_in_foreground: online ? 1 : 0
      };

      const response = await this.httpClient.post(
        `${FB_URLS.WWW}/ajax/mercury/change_presence.php`,
        form
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      this.logger.error('Error changing presence:', error.message);
      throw error;
    }
  }
}

module.exports = Users;
