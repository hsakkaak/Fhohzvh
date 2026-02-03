class CheckpointDetector {
  constructor(logger) {
    this.logger = logger;
    this.checkpointPatterns = [
      /checkpoint/i,
      /verify.*identity/i,
      /confirm.*account/i,
      /suspicious.*activity/i,
      /review.*required/i,
      /security.*check/i,
      /unusual.*activity/i,
      /verify.*you/i,
      /confirm.*phone/i,
      /two.*factor/i,
      /authentication.*required/i
    ];
    
    this.errorPatterns = [
      /session.*expired/i,
      /login.*again/i,
      /account.*locked/i,
      /temporarily.*blocked/i,
      /rate.*limit/i,
      /too.*many.*requests/i,
      /please.*try.*later/i
    ];
    
    this.detectionCount = 0;
    this.lastDetectionTime = null;
  }

  checkResponse(response) {
    if (!response) return { detected: false };
    
    const result = {
      detected: false,
      type: null,
      confidence: 0,
      message: null,
      recommendation: null
    };
    
    const responseText = typeof response === 'string' 
      ? response 
      : JSON.stringify(response);
    
    for (const pattern of this.checkpointPatterns) {
      if (pattern.test(responseText)) {
        result.detected = true;
        result.type = 'checkpoint';
        result.confidence = 0.9;
        result.message = 'Checkpoint or verification page detected';
        result.recommendation = 'Stop all automated activity immediately and verify account manually';
        this.recordDetection();
        this.logger.error('🚨 CHECKPOINT DETECTED! Immediate action required!');
        break;
      }
    }
    
    if (!result.detected) {
      for (const pattern of this.errorPatterns) {
        if (pattern.test(responseText)) {
          result.detected = true;
          result.type = 'error';
          result.confidence = 0.7;
          result.message = 'Potential account issue detected';
          result.recommendation = 'Reduce activity and monitor account status';
          this.recordDetection();
          this.logger.warn('⚠️  Potential account issue detected');
          break;
        }
      }
    }
    
    return result;
  }

  checkStatusCode(statusCode) {
    const suspiciousCodes = [401, 403, 429, 503];
    
    if (suspiciousCodes.includes(statusCode)) {
      this.logger.warn(`Suspicious HTTP status code: ${statusCode}`);
      return {
        detected: true,
        type: 'http_error',
        statusCode,
        confidence: 0.6,
        message: `HTTP ${statusCode} received`,
        recommendation: statusCode === 429 
          ? 'Rate limit hit - reduce request frequency'
          : 'Authentication or access issue - check account status'
      };
    }
    
    return { detected: false };
  }

  checkHTML(html) {
    if (!html || typeof html !== 'string') return { detected: false };
    
    const checkpointIndicators = [
      'id="checkpoint"',
      'checkpoint_title',
      'checkpoint-subtitle',
      'security_checkpoint',
      'identity_verification',
      'class="checkpoint"'
    ];
    
    for (const indicator of checkpointIndicators) {
      if (html.includes(indicator)) {
        this.logger.error('🚨 Checkpoint HTML structure detected!');
        this.recordDetection();
        return {
          detected: true,
          type: 'checkpoint_html',
          confidence: 0.95,
          message: 'Checkpoint page structure detected in HTML',
          recommendation: 'STOP all activity immediately - manual verification required'
        };
      }
    }
    
    return { detected: false };
  }

  checkCookies(cookies) {
    if (!cookies) return { detected: false };
    
    const cookieString = Array.isArray(cookies)
      ? cookies.map(c => `${c.key}=${c.value}`).join(';')
      : cookies;
    
    if (cookieString.includes('checkpoint') || cookieString.includes('verification')) {
      this.logger.warn('Checkpoint-related cookies detected');
      return {
        detected: true,
        type: 'checkpoint_cookie',
        confidence: 0.8,
        message: 'Checkpoint indicators in cookies',
        recommendation: 'Monitor account closely - verification may be required'
      };
    }
    
    return { detected: false };
  }

  recordDetection() {
    this.detectionCount++;
    this.lastDetectionTime = Date.now();
  }

  getDetectionStats() {
    return {
      totalDetections: this.detectionCount,
      lastDetection: this.lastDetectionTime,
      timeSinceLastDetection: this.lastDetectionTime 
        ? Date.now() - this.lastDetectionTime 
        : null
    };
  }

  isAccountHealthy() {
    if (this.detectionCount === 0) return true;
    
    const timeSinceLast = Date.now() - (this.lastDetectionTime || 0);
    const oneHour = 60 * 60 * 1000;
    
    if (this.detectionCount >= 3 && timeSinceLast < oneHour) {
      this.logger.error('Account health critical - multiple checkpoints detected recently');
      return false;
    }
    
    return true;
  }

  reset() {
    this.detectionCount = 0;
    this.lastDetectionTime = null;
    this.logger.info('Checkpoint detector reset');
  }
}

module.exports = CheckpointDetector;
