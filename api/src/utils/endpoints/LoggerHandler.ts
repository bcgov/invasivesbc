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
  override error = (message: string, params: Error) => {
    this._instance.error(params.stack, this.buildLog(message));
  };
  override warn = (message: string, params?: Record<PropertyKey, unknown>) =>
    this._instance.warn(this.buildLog(message, params));
  override info = (message: string, params?: Record<PropertyKey, unknown>) =>
    this._instance.info(this.buildLog(message, params));
  verbose = (message: string, params?: Record<PropertyKey, unknown>) =>
    this._instance.verbose(this.buildLog(message, params));
  override debug = (message: string, params?: Record<PropertyKey, unknown>) =>
    this._instance.debug(this.buildLog(message, params));
}

export default LoggerHandler;
