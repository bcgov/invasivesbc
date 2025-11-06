import winston from 'winston';
import _ from 'lodash';
import YAML from 'js-yaml';
import { InvasivesRequest } from './auth-utils';
import { MDCAsyncLocal } from 'mdc';

interface Context {
  additionalContext: {
    authContext?: InvasivesRequest['authContext'];
    [key: PropertyKey]: unknown;
  };
  [key: PropertyKey]: unknown;
}

class LoggerWithContext {
  _instance: winston.Logger;
  protected outputLabel: string;

  constructor(outputLabel = 'default') {
    this.outputLabel = outputLabel;

    this._instance = winston.loggers.get(outputLabel, {
      transports: [this.createConsoleTransport()]
    });
  }

  private readonly createConsoleTransport = () =>
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize({ all: true }),
        winston.format.errors({ stack: true }),
        winston.format.printf((args) => this.print(args))
      )
    });

  protected print({ level, timestamp, message, ...meta }: Record<PropertyKey, unknown>) {
    const preamble = `[${timestamp}][${level}][${this.outputLabel}]: `;
    const formattedMessage: string = (() => {
      switch (typeof message) {
        case 'object': {
          try {
            return YAML.dump(message);
          } catch {
            return JSON.stringify(message, null, 2);
          }
        }
        case 'string':
        case 'number':
        case 'boolean':
        case 'bigint':
          return `${message}`;
        case 'undefined':
          return 'undefined';
        default:
          return 'Unknown message';
      }
    })();

    const { MDC, ...everythingElse } = meta;
    const additionalContext = structuredClone(everythingElse);

    const formattedAdditionalContext = (() => {
      const authContext: InvasivesRequest['authContext'] = (MDC as Context)?.additionalContext?.authContext;
      if (authContext) {
        const user_id: string | number = authContext?.user?.user_id ?? 'nil';
        const roles: string = authContext?.roles?.map(({ role_name }) => role_name).join(', ') ?? 'nil';
        const username: string = authContext?.user?.preferred_username ?? 'nil';
        const activation_status: boolean = !!authContext?.user?.activation_status;

        _.forOwn(additionalContext, (value: unknown, key: PropertyKey) => {
          if (value === null || value === undefined) {
            delete additionalContext[key];
          }
        });
        try {
          const activationWarning = activation_status ? '' : '[USER IS NOT ACTIVATED] ';
          const userDetailString = `ID: ${user_id} | User: ${username} | Roles: ${roles}\n`;
          const additionalDetailsYaml = Object.keys(additionalContext).length > 0 ? YAML.dump(additionalContext) : '';
          /**
           * @example [2025-11-06 13:52:11][info][auth-utils]: [authenticate]: New user created from token
           *          ID: 111 | User: JohnSmith@bcgov | Roles: contractor, surveyor
           *          ---------------------------------------
           */
          return activationWarning + userDetailString + additionalDetailsYaml;
        } catch {
          try {
            return JSON.stringify(additionalContext, null, 2);
          } catch {
            return 'Error in logger while dumping additional context object.';
          }
        }
      }
      return '';
    })();
    const spacer = formattedAdditionalContext ? '-'.repeat(40) : '';
    return `${preamble}${formattedMessage}\n${formattedAdditionalContext ?? ''}${spacer}`;
  }

  static readonly _loadMDC = () => {
    const MDC = MDCAsyncLocal.getStore();
    if (MDC !== undefined) {
      let timeDelta: null | number = null;
      timeDelta = new Date().getTime() - MDC.request.startTime;
      MDC.request.execTime = timeDelta;
      return MDC;
    }
    return null;
  };

  // Methods for Calling Logs
  public info(params) {
    this._instance.info({ ...params, MDC: LoggerWithContext._loadMDC() });
  }

  public debug(params) {
    this._instance.debug({ ...params, MDC: LoggerWithContext._loadMDC() });
  }

  public warn(params) {
    this._instance.warn({ ...params, MDC: LoggerWithContext._loadMDC() });
  }

  public error(error, message?: string) {
    this._instance.error({ message, error, MDC: LoggerWithContext._loadMDC() });
  }
}

export const getLogger = function (logLabel: string): LoggerWithContext {
  return new LoggerWithContext(logLabel);
};
export { LoggerWithContext };
