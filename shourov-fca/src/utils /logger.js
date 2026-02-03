const pino = require('pino');

const logLevels = {
  silent: Infinity,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10
};

class Logger {
  constructor(options = {}) {
    const level = options.logLevel || 'info';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const pinoConfig = {
      level: level,
      formatters: {
        level: (label) => {
          return { level: label };
        }
      },
      ...(isDevelopment ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'HH:MM:ss',
          }
        }
      } : {})
    };
    
    this.logger = pino(pinoConfig);
  }

  error(...args) {
    this.logger.error(...args);
  }

  warn(...args) {
    this.logger.warn(...args);
  }

  info(...args) {
    this.logger.info(...args);
  }

  debug(...args) {
    this.logger.debug(...args);
  }

  trace(...args) {
    this.logger.trace(...args);
  }

  setLevel(level) {
    this.logger.level = level;
  }
}

module.exports = Logger;
