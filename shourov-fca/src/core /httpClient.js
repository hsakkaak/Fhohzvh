
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { FB_URLS, FB_ENDPOINTS } = require('../utils/constants');
const { formatCookie, getCookieValue, retryWithBackoff } = require('../utils/helpers');
const RateLimiter = require('../utils/rateLimiter');
const HeaderRandomizer = require('../utils/headerRandomizer');

class HttpClient {
  constructor(appState, options = {}, logger, modules = {}) {
    this.appState = appState;
    this.options = options;
    this.logger = logger;
    this.userAgent = options.userAgent;
    this.proxy = options.proxy;
    this.rateLimiter = new RateLimiter(logger);
    this.deviceFingerprint = modules.deviceFingerprint;
    this.checkpointDetector = modules.checkpointDetector;
    this.headerRandomizer = this.deviceFingerprint 
      ? new HeaderRandomizer(logger, this.deviceFingerprint) 
      : null;
    
    this.tokens = {
      fb_dtsg: null,
      jazoest: null,
      lsd: null,
      userId: null
    };
    
    this.axiosInstance = this.createAxiosInstance();
  }

  createAxiosInstance() {
    const config = {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      withCredentials: true,
      maxRedirects: 5,
      validateStatus: () => true
    };

    if (this.proxy) {
      config.httpsAgent = new HttpsProxyAgent(this.proxy);
      config.httpAgent = new HttpsProxyAgent(this.proxy);
      this.logger.info(`Using proxy: ${this.proxy}`);
    }

    return axios.create(config);
  }

  getCookieString() {
    return formatCookie(this.appState);
  }

  async extractTokens() {
    try {
      this.logger.debug('Extracting tokens from Facebook...');
      
      const headers = this.headerRandomizer 
        ? this.headerRandomizer.getHeadersForRequest('page', { cookie: this.getCookieString() })
        : { 'Cookie': this.getCookieString() };
      
      const response = await this.axiosInstance.get(FB_URLS.WWW, { headers });

      const html = response.data;
      
      if (this.checkpointDetector) {
        const checkpointCheck = this.checkpointDetector.checkHTML(html);
        if (checkpointCheck.detected) {
          this.logger.error(`🚨 ${checkpointCheck.message}`);
          throw new Error(`Checkpoint detected: ${checkpointCheck.recommendation}`);
        }
        
        const statusCheck = this.checkpointDetector.checkStatusCode(response.status);
        if (statusCheck.detected) {
          this.logger.warn(`⚠️ ${statusCheck.message}`);
        }
      }
      
      const dtsgMatch = html.match(/"DTSGInitialData",\[\],{"token":"([^"]+)"/);
      if (dtsgMatch) {
        this.tokens.fb_dtsg = dtsgMatch[1];
      }

      const jazoestMatch = html.match(/"jazoest".*?"(\d+)"/);
      if (jazoestMatch) {
        this.tokens.jazoest = jazoestMatch[1];
      }

      const lsdMatch = html.match(/"LSD",\[\],{"token":"([^"]+)"/);
      if (lsdMatch) {
        this.tokens.lsd = lsdMatch[1];
      }

      this.tokens.userId = getCookieValue(this.appState, 'c_user');

      this.logger.debug('Tokens extracted successfully', {
        hasDtsg: !!this.tokens.fb_dtsg,
        hasJazoest: !!this.tokens.jazoest,
        hasLsd: !!this.tokens.lsd,
        userId: this.tokens.userId
      });

      return this.tokens;
    } catch (error) {
      this.logger.error('Failed to extract tokens:', error.message);
      throw error;
    }
  }

  async post(url, data, extraHeaders = {}) {
    const endpoint = new URL(url).pathname;
    const requestType = endpoint.includes('send') ? 'message' : 'api';
    
    await this.rateLimiter.waitIfNeeded(endpoint, requestType);

    const executeRequest = async () => {
      const formData = new URLSearchParams();
      
      for (const key in data) {
        formData.append(key, data[key]);
      }

      if (this.tokens.fb_dtsg) {
        formData.append('fb_dtsg', this.tokens.fb_dtsg);
      }
      if (this.tokens.jazoest) {
        formData.append('jazoest', this.tokens.jazoest);
      }

      const baseHeaders = this.headerRandomizer 
        ? this.headerRandomizer.getHeadersForRequest('api', { cookie: this.getCookieString() })
        : {
            'Cookie': this.getCookieString(),
            'Content-Type': 'application/x-www-form-urlencoded'
          };

      const response = await this.axiosInstance.post(url, formData, {
        headers: {
          ...baseHeaders,
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-FB-Friendly-Name': 'MessengerGraphQLThreadFetcher',
          'X-FB-LSD': this.tokens.lsd || '',
          ...extraHeaders
        }
      });

      if (this.checkpointDetector) {
        const responseCheck = this.checkpointDetector.checkResponse(response.data);
        if (responseCheck.detected && responseCheck.confidence > 0.8) {
          this.logger.error(`🚨 ${responseCheck.message}: ${responseCheck.recommendation}`);
        }
      }

      return response;
    };

    return retryWithBackoff(executeRequest, this.options.maxRetries || 3, this.options.retryDelay || 1000);
  }

  async get(url, extraHeaders = {}) {
    const endpoint = new URL(url).pathname;
    await this.rateLimiter.waitIfNeeded(endpoint, 'api');

    const executeRequest = async () => {
      const response = await this.axiosInstance.get(url, {
        headers: {
          'Cookie': this.getCookieString(),
          ...extraHeaders
        }
      });

      return response;
    };

    return retryWithBackoff(executeRequest, this.options.maxRetries || 3, this.options.retryDelay || 1000);
  }

  getTokens() {
    return this.tokens;
  }

  getUserId() {
    return this.tokens.userId;
  }
}

module.exports = HttpClient;
