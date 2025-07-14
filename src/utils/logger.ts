// Mock Logging Middleware for the application
export class Logger {
  private static instance: Logger;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || '');
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data || '');
  }

  debug(message: string, data?: any) {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, data || '');
  }
}

export const logger = Logger.getInstance();