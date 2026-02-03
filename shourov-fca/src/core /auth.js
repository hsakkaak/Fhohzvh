
const cheerio = require('cheerio');
const { FB_URLS } = require('../utils/constants');
const { 
  LoginError, 
  CheckpointError, 
  AccountLockedError, 
  AccountSuspendedError 
} = require('../utils/errors');
const { isValidAppState, getCookieValue } = require('../utils/helpers');

class Auth {
  constructor(httpClient, logger) {
    this.httpClient = httpClient;
    this.logger = logger;
  }

  async validateAppState(appState) {
    this.logger.debug('Validating AppState...');
    
    if (!isValidAppState(appState)) {
      throw new LoginError('Invalid AppState format. Required cookies: c_user, xs');
    }

    const userId = getCookieValue(appState, 'c_user');
    if (!userId) {
      throw new LoginError('Missing c_user cookie in AppState');
    }

    this.logger.info(`AppState validation passed for user: ${userId}`);
    return true;
  }

  async checkAccountStatus() {
    try {
      this.logger.debug('Checking account status...');
      
      const response = await this.httpClient.get(FB_URLS.WWW);
      const html = response.data;
      const $ = cheerio.load(html);

      if (html.includes('checkpoint') || response.request.path.includes('checkpoint')) {
        throw new CheckpointError('Account requires checkpoint verification', {
          url: response.request.res.responseUrl || 'https://www.facebook.com/checkpoint'
        });
      }

      if (html.includes('account_disabled') || html.includes('Your Account Has Been Disabled')) {
        throw new AccountSuspendedError('Account has been suspended or disabled');
      }

      if (html.includes('account_locked') || html.includes('temporarily locked')) {
        throw new AccountLockedError('Account is temporarily locked');
      }

      if (html.includes('login_attempt_limit')) {
        throw new LoginError('Too many login attempts. Please try again later');
      }

      const title = $('title').text();
      if (title.includes('Log In') || title.includes('Facebook – log in')) {
        throw new LoginError('Session expired. Please provide fresh cookies');
      }

      this.logger.info('Account status: Active and healthy');
      return true;
    } catch (error) {
      if (error.name.includes('Error')) {
        throw error;
      }
      this.logger.error('Failed to check account status:', error.message);
      throw new LoginError('Failed to verify account status', { originalError: error.message });
    }
  }

  async login(appState) {
    try {
      this.logger.info('Starting login process...');
      
      await this.validateAppState(appState);
      
      await this.checkAccountStatus();
      
      const tokens = await this.httpClient.extractTokens();
      
      if (!tokens.fb_dtsg || !tokens.userId) {
        throw new LoginError('Failed to extract required tokens from Facebook');
      }

      this.logger.info(`Login successful! User ID: ${tokens.userId}`);
      
      return {
        success: true,
        userId: tokens.userId,
        tokens: tokens
      };
    } catch (error) {
      this.logger.error('Login failed:', error.message);
      throw error;
    }
  }

  async refreshTokens() {
    try {
      this.logger.debug('Refreshing authentication tokens...');
      const tokens = await this.httpClient.extractTokens();
      this.logger.info('Tokens refreshed successfully');
      return tokens;
    } catch (error) {
      this.logger.error('Failed to refresh tokens:', error.message);
      throw error;
    }
  }
}

module.exports = Auth;
