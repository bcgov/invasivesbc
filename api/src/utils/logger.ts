import winston, { Logform } from 'winston';
import _ from 'lodash';
import YAML from 'js-yaml';
import { MDCAsyncLocal } from '../mdc';

/**
 * Logger input.
 *
 * @export
 * @interface ILoggerMessage
 * @extends {winston.Logform.TransformableInfo}
 */
interface ILoggerMessage extends winston.Logform.TransformableInfo {
  timestamp?: string; // Optionally overwrite the default timestamp
  label?: string; // Add a label to this message (generally the name of the parent function)
  error?: Error; // An optional error to display
}

class LoggerWithContext {
  _instance: winston.Logger;

  constructor(outputLabel = 'default') {
    this._instance = winston.loggers.get(outputLabel, {
      transports: [
        new winston.transports.Console({
          level: process.env.LOG_LEVEL || 'debug',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.colorize(),
            winston.format.printf(({ level, timestamp, label, message, ...meta }) => {
              const optionalLabel = label ? ` ${label} - ` : '';
              const preamble = `[${timestamp}] (${level}) (${outputLabel}):${optionalLabel}`;
              //
              let formattedMessage = '';
              switch (typeof message) {
                case 'object':
                  try {
                    formattedMessage = YAML.dump(message);
                  } catch (e) {
                    formattedMessage = JSON.stringify(message, null, 2);
                  }

                  break;
                default:
                  formattedMessage = message;
                  break;
              }
              const additionalContext = {
                ...meta
              };
              _.forOwn(additionalContext, (prop) => {
                if (prop === null) {
                  delete additionalContext[prop];
                }
              });

              if (additionalContext['MDC'] !== undefined && additionalContext['MDC'] === null) {
                delete additionalContext['MDC'];
              }

              let formattedAdditionalContext = null;

              if (_.keys(additionalContext).length > 0) {
                try {
                  formattedAdditionalContext = YAML.dump(additionalContext);
                } catch (e) {
                  try {
                    formattedAdditionalContext = JSON.stringify(additionalContext, null, 2);
                  } catch (f) {
                    formattedAdditionalContext = 'Error in logger while dumping additional context object.';
                  }
                }
              }

              if (formattedAdditionalContext) {
                const spacer = '-'.repeat(40);
                return `${preamble}${formattedMessage}\n${formattedAdditionalContext}${spacer}`;
              } else {
                return `${preamble}${formattedMessage}`;
              }
            })
          )
        })
      ]
    });
  }

  static _loadMDC() {
    const MDC = MDCAsyncLocal.getStore();
    if (MDC !== undefined) {
      let timeDelta: null | number = null;
      timeDelta = new Date().getTime() - MDC.request.startTime;
      MDC.request.execTime = timeDelta;
      return MDC;
    }
    return null;
  }

  info(params) {
    this._instance.info({ ...params, MDC: LoggerWithContext._loadMDC() });
  }

  debug(params) {
    this._instance.debug({ ...params, MDC: LoggerWithContext._loadMDC() });
  }

  warn(params) {
    this._instance.warn({ ...params, MDC: LoggerWithContext._loadMDC() });
  }

  error(params) {
    const stack = new Error().stack;
    this._instance.error(params, {
      callingContext: stack
    });
  }
}

export const getLogger = function (logLabel: string): LoggerWithContext {
  return new LoggerWithContext(logLabel);
};
