class HeaderRandomizer {
  constructor(logger, deviceFingerprint) {
    this.logger = logger;
    this.deviceFingerprint = deviceFingerprint;
    
    this.acceptLanguages = [
      'en-US,en;q=0.9',
      'en-US,en;q=0.9,es;q=0.8',
      'en-GB,en;q=0.9',
      'en-US,en;q=0.9,fr;q=0.8',
      'en-US,en;q=0.9,de;q=0.8'
    ];
    
    this.secFetchModes = ['navigate', 'cors', 'no-cors', 'same-origin'];
    this.secFetchSites = ['none', 'same-origin', 'same-site', 'cross-site'];
    this.secFetchDests = ['document', 'empty', 'iframe', 'image', 'script'];
  }

  getBaseHeaders() {
    const browserInfo = this.deviceFingerprint.getBrowserInfo();
    const screenInfo = this.deviceFingerprint.getScreenInfo();
    
    return {
      'User-Agent': this.generateUserAgent(browserInfo),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': this.getRandomItem(this.acceptLanguages),
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': Math.random() < 0.3 ? '1' : undefined,
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': this.generateSecChUa(browserInfo),
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': `"${this.getPlatformName()}"`,
      'Viewport-Width': screenInfo.width.toString(),
      'DPR': '1'
    };
  }

  getAPIHeaders(referer = 'https://www.facebook.com/') {
    const browserInfo = this.deviceFingerprint.getBrowserInfo();
    
    return {
      'User-Agent': this.generateUserAgent(browserInfo),
      'Accept': '*/*',
      'Accept-Language': this.getRandomItem(this.acceptLanguages),
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': referer,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.facebook.com',
      'DNT': Math.random() < 0.3 ? '1' : undefined,
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'sec-ch-ua': this.generateSecChUa(browserInfo),
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': `"${this.getPlatformName()}"`
    };
  }

  generateUserAgent(browserInfo) {
    const { name, version } = browserInfo;
    const platform = this.deviceFingerprint.getAll().platform;
    
    if (name === 'Chrome') {
      return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
    } else if (name === 'Firefox') {
      return `Mozilla/5.0 (${platform}; rv:${version.split('.')[0]}.0) Gecko/20100101 Firefox/${version}`;
    } else if (name === 'Safari') {
      return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version} Safari/605.1.15`;
    } else if (name === 'Edge') {
      return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36 Edg/${version}`;
    }
    
    return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version} Safari/537.36`;
  }

  generateSecChUa(browserInfo) {
    const { name, version } = browserInfo;
    const majorVersion = version.split('.')[0];
    
    if (name === 'Chrome') {
      return `"Chromium";v="${majorVersion}", "Google Chrome";v="${majorVersion}", "Not-A.Brand";v="99"`;
    } else if (name === 'Edge') {
      return `"Chromium";v="${majorVersion}", "Microsoft Edge";v="${majorVersion}", "Not-A.Brand";v="99"`;
    }
    
    return `"Chromium";v="${majorVersion}", "Not-A.Brand";v="99"`;
  }

  getPlatformName() {
    const platform = this.deviceFingerprint.getAll().platform;
    if (platform.includes('Win')) return 'Windows';
    if (platform.includes('Mac')) return 'macOS';
    if (platform.includes('Linux')) return 'Linux';
    return 'Windows';
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  addRandomVariation(headers) {
    const varied = { ...headers };
    
    if (Math.random() < 0.2) {
      delete varied['DNT'];
    }
    
    if (Math.random() < 0.3) {
      varied['Sec-Fetch-Mode'] = this.getRandomItem(this.secFetchModes);
    }
    
    if (Math.random() < 0.1) {
      varied['Priority'] = this.getRandomItem(['u=0, i', 'u=1', 'u=2']);
    }
    
    Object.keys(varied).forEach(key => {
      if (varied[key] === undefined) {
        delete varied[key];
      }
    });
    
    return varied;
  }

  getHeadersForRequest(type = 'api', options = {}) {
    let headers;
    
    if (type === 'page') {
      headers = this.getBaseHeaders();
    } else {
      headers = this.getAPIHeaders(options.referer);
    }
    
    headers = this.addRandomVariation(headers);
    
    if (options.cookie) {
      headers['Cookie'] = options.cookie;
    }
    
    return headers;
  }
}

module.exports = HeaderRandomizer;
