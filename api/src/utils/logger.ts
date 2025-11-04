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
      transports: [this.createConsoleTransport()],
      exceptionHandlers: [this.createConsoleTransport()]
    });
  }

  private createConsoleTransport = () =>
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
          } catch (_e) {
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
    let additionalContext = _.cloneDeep(everythingElse);

    const formattedAdditionalContext = (() => {
      const authContext: InvasivesRequest['authContext'] = (MDC as Context)?.additionalContext?.authContext;
      if (authContext) {
        const user_id: string = authContext?.user?.user_id ?? 'nil';
        const roles: string = authContext?.roles?.map(({ role_name }) => role_name).join(', ') ?? 'nil';
        const username: string = authContext?.user?.preferred_username ?? 'nil';
        const activation_status: boolean = authContext?.user?.activation_status;

        additionalContext = {
          ...additionalContext
        };

        _.forOwn(additionalContext, (value: unknown, key: PropertyKey) => {
          if (value === null || value === undefined) {
            delete additionalContext[key];
          }
        });
        if (_.keys(additionalContext).length > 0) {
          try {
            const activation = activation_status ? '' : '[USER IS NOT ACTIVATED]';
            /**
             * @example  ID: 1 | User: JohnSmith@provider | Roles: general_contractor, specialist
             *           Result: [23]
             */
            return activation + `ID: ${user_id} | User: ${username} | Roles: ${roles}\n` + YAML.dump(additionalContext);
          } catch (_e) {
            try {
              return JSON.stringify(additionalContext, null, 2);
            } catch (_f) {
              return 'Error in logger while dumping additional context object.';
            }
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
