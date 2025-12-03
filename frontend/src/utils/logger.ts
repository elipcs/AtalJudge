

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    
    console.log(`[DEBUG] ${message}`, context || '');
  }

  info(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    
    console.info(`[INFO] ${message}`, context || '');
  }

  warn(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    
    console.warn(`[WARN] ${message}`, context || '');
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '');
    }

    if (this.isProduction) {
      this.sendToMonitoring(message, error, context);
    }
  }

  success(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    
    console.log(`[SUCCESS] ✅ ${message}`, context || '');
  }

  apiCall(method: string, url: string, status?: number, duration?: number): void {
    if (!this.isDevelopment) return;
    
    const statusEmoji = status && status >= 200 && status < 300 ? '✅' : '❌';
    const durationText = duration ? ` (${duration}ms)` : '';
    
    console.log(`[API] ${statusEmoji} ${method} ${url}${durationText}`, status ? `Status: ${status}` : '');
  }

  private sendToMonitoring(message: string, error?: Error | unknown, context?: LogContext): void {

    console.error('[PRODUCTION ERROR]', {
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    });
  }

  group(label: string, callback: () => void): void {
    if (!this.isDevelopment) {
      callback();
      return;
    }
    
    console.group(label);
    callback();
    console.groupEnd();
  }

  async time<T>(label: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await operation();
      const duration = Math.round(performance.now() - start);
      
      this.debug(`${label} completed in ${duration}ms`);
      
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      this.error(`${label} failed after ${duration}ms`, error);
      throw error;
    }
  }

  createContext(contextName: string) {
    return {
      debug: (message: string, context?: LogContext) => 
        this.debug(`[${contextName}] ${message}`, context),
      info: (message: string, context?: LogContext) => 
        this.info(`[${contextName}] ${message}`, context),
      warn: (message: string, context?: LogContext) => 
        this.warn(`[${contextName}] ${message}`, context),
      error: (message: string, error?: Error | unknown, context?: LogContext) => 
        this.error(`[${contextName}] ${message}`, error, context),
      success: (message: string, context?: LogContext) => 
        this.success(`[${contextName}] ${message}`, context),
    };
  }
}

export const logger = new Logger();

export const apiLogger = logger.createContext('API');
export const authLogger = logger.createContext('AUTH');
export const uiLogger = logger.createContext('UI');

export { Logger };

