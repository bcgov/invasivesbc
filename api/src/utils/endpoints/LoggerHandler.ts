import { CustomError } from 'middleware/globalErrorHandler';
import { LoggerWithContext } from 'utils/logger';

class LoggerHandler extends LoggerWithContext {
  constructor(label: string = 'undefined') {
    super(label);
  }

  private readonly buildLog = (message: string, params?: Record<PropertyKey, unknown>) => ({
    ...params,
    message,
    MDC: LoggerWithContext._loadMDC()
  });

  /* 
    Logger Priority Order when settings ENV's 
      1. Error
      2. Warn
      3. Info
      4. Verbose
      5. Debug
  */
  override error(err: Error | CustomError, message?: string) {
    const m = message ? '\n' + message : message; // Add Newline so not to group into Error Object in log.
    this._instance.error(err?.stack, this.buildLog(m));
    return this;
  }
  override warn = (message: string, params?: Record<PropertyKey, unknown>) => {
    this._instance.warn(this.buildLog(message, params));
    return this;
  };
  override info = (message: string, params?: Record<PropertyKey, unknown>) => {
    this._instance.info(this.buildLog(message, params));
    return this;
  };
  verbose = (message: string, params?: Record<PropertyKey, unknown>) => {
    this._instance.verbose(this.buildLog(message, params));
    return this;
  };
  override debug = (message: string, params?: Record<PropertyKey, unknown>) => {
    this._instance.debug(this.buildLog(message, params));
    return this;
  };
}

export default LoggerHandler;
