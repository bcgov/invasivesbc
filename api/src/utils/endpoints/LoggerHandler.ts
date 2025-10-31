import { LoggerWithContext } from 'utils/logger';

class LoggerHandler extends LoggerWithContext {
  private readonly namespace: string;
  constructor(namespace: string = 'undefined') {
    super(namespace);
    this.namespace = namespace;
  }

  private buildLog(message: string, params?: Record<PropertyKey, unknown>) {
    return {
      ...params,
      message,
      namespace: `/api/${this.namespace}`,
      
      MDC: LoggerWithContext._loadMDC()
    };
  }
  override info = (message: string, params?: Record<PropertyKey, unknown>) => this._instance.info(this.buildLog(message, params));

  override debug = (message: string, params?: Record<PropertyKey, unknown>) => this._instance.debug(this.buildLog(message, params));

  override warn = (message: string, params?: Record<PropertyKey, unknown>) => this._instance.warn(this.buildLog(message, params));

  override error = (message: string, params?) => {
    const stack = new Error().stack;
    this._instance.error({message, ...params}, {
      callingContext: stack
    });
  };
}

export default LoggerHandler;
