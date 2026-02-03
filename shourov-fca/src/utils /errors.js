const { ERROR_CODES } = require('./constants');

class ShourovError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ShourovError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class LoginError extends ShourovError {
  constructor(message, details = {}) {
    super(message, ERROR_CODES.LOGIN_FAILED, details);
    this.name = 'LoginError';
  }
}

class CheckpointError extends ShourovError {
  constructor(message, details = {}) {
    super(message, ERROR_CODES.CHECKPOINT_REQUIRED, details);
    this.name = 'CheckpointError';
  }
}

class AccountLockedError extends ShourovError {
  constructor(message, details = {}) {
    super(message, ERROR_CODES.ACCOUNT_LOCKED, details);
    this.name = 'AccountLockedError';
  }
}

class AccountSuspendedError extends ShourovError {
  constructor(message, details = {}) {
    super(message, ERROR_CODES.ACCOUNT_SUSPENDED, details);
    this.name = 'AccountSuspendedError';
  }
}

class SessionExpiredError extends ShourovError {
  constructor(message, details = {}) {
    super(message, ERROR_CODES.SESSION_EXPIRED, details);
    this.name = 'SessionExpiredError';
  }
}

class RateLimitError extends ShourovError {
  constructor(message, details = {}) {
    super(message, ERROR_CODES.RATE_LIMIT, details);
    this.name = 'RateLimitError';
  }
}

module.exports = {
  ShourovError,
  LoginError,
  CheckpointError,
  AccountLockedError,
  AccountSuspendedError,
  SessionExpiredError,
  RateLimitError
};
