/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Custom logger utility for the application
 * Uses color-coded output and structured logging
 */

type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

interface LogOptions {
  timestamp?: boolean;
  context?: string;
  details?: Record<string, any>;
}

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

// Log level colors and prefixes
const logLevelConfig: Record<LogLevel, { color: string; prefix: string }> = {
  info: { color: colors.blue, prefix: 'INFO' },
  success: { color: colors.green, prefix: 'SUCCESS' },
  warn: { color: colors.yellow, prefix: 'WARNING' },
  error: { color: colors.red, prefix: 'ERROR' },
  debug: { color: colors.magenta, prefix: 'DEBUG' },
};

// Default options
const defaultOptions: LogOptions = {
  timestamp: true,
  context: 'App',
};

/**
 * Format the current timestamp
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

/**
 * Format a log message with color and metadata
 */
function formatLogMessage(
  level: LogLevel,
  message: string,
  options: LogOptions = {}
): string {
  const { color, prefix } = logLevelConfig[level];
  const opts = { ...defaultOptions, ...options };
  
  let formattedMessage = '';
  
  // Add timestamp if enabled
  if (opts.timestamp) {
    formattedMessage += `${colors.dim}[${getTimestamp()}]${colors.reset} `;
  }
  
  // Add context if provided
  if (opts.context) {
    formattedMessage += `${colors.cyan}[${opts.context}]${colors.reset} `;
  }
  
  // Add log level prefix with color
  formattedMessage += `${color}${colors.bright}[${prefix}]${colors.reset} `;
  
  // Add the actual message
  formattedMessage += message;
  
  // Add structured details if any
  if (opts.details && Object.keys(opts.details).length > 0) {
    formattedMessage += `\n${colors.dim}${JSON.stringify(opts.details, null, 2)}${colors.reset}`;
  }
  
  return formattedMessage;
}

/**
 * Log to console based on environment
 */
function logToConsole(level: LogLevel, message: string, options?: LogOptions): void {
  const formattedMessage = formatLogMessage(level, message, options);
  
  switch (level) {
    case 'error':
      console.error(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'debug':
      if (process.env.NODE_ENV !== 'production') {
        console.debug(formattedMessage);
      }
      break;
    case 'info':
    case 'success':
    default:
      console.log(formattedMessage);
  }
}

/**
 * Logger API
 */
export const logger = {
  info(message: string, options?: LogOptions): void {
    logToConsole('info', message, options);
  },
  
  success(message: string, options?: LogOptions): void {
    logToConsole('success', message, options);
  },
  
  warn(message: string, options?: LogOptions): void {
    logToConsole('warn', message, options);
  },
  
  error(message: string, options?: LogOptions): void {
    logToConsole('error', message, options);
  },
  
  debug(message: string, options?: LogOptions): void {
    logToConsole('debug', message, options);
  },
  
  // Log for authentication events
  auth(message: string, options?: LogOptions): void {
    logToConsole('info', message, { ...options, context: 'Auth' });
  },
  
  // Log for database operations
  db(message: string, options?: LogOptions): void {
    logToConsole('info', message, { ...options, context: 'Database' });
  },
  
  // Log for API requests
  api(message: string, options?: LogOptions): void {
    logToConsole('info', message, { ...options, context: 'API' });
  },
  
  // Create a child logger with a specific context
  createLogger(context: string) {
    return {
      info: (message: string, options?: LogOptions) => 
        logger.info(message, { ...options, context }),
      success: (message: string, options?: LogOptions) => 
        logger.success(message, { ...options, context }),
      warn: (message: string, options?: LogOptions) => 
        logger.warn(message, { ...options, context }),
      error: (message: string, options?: LogOptions) => 
        logger.error(message, { ...options, context }),
      debug: (message: string, options?: LogOptions) => 
        logger.debug(message, { ...options, context }),
    };
  },
};