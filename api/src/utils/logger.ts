import winston from 'winston';
import _ from 'lodash';
import YAML from 'js-yaml';

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
            winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
            winston.format.errors({stack: true}),
            winston.format.colorize(),
            winston.format.printf(({level, timestamp, label, message, ...meta}) => {
              const optionalLabel = label ? ` ${label} - ` : '';
              const preamble = `[${timestamp}] (${level}) (${outputLabel}):${optionalLabel}`;
              //
              let formattedMessage = '';
              switch (typeof message) {
                case 'object':
                  formattedMessage = JSON.stringify(message, null, 2);
                  break;
                default:
                  formattedMessage = message;
                  break;
              }
              const additionalContext = {
                ...meta
              };
              _.forOwn(additionalContext, (prop) => {
                if (prop == null || prop == [] || prop == {}) {
                  delete additionalContext[prop];
                }
              });

              let formattedAdditionalContext = null;

              if (_.keys(additionalContext).length > 0) {
                formattedAdditionalContext = YAML.dump(additionalContext);
              }

              if (formattedAdditionalContext) {
                const spacer = '-'.repeat(40);
                const shortSpacer = '-'.repeat(10);
                return `${spacer}\n${preamble}\nMessage: ${formattedMessage}\n${shortSpacer}\nAdditional Context:\n${shortSpacer}\n${formattedAdditionalContext}\n${spacer}`;
              } else {
                return `${preamble}${formattedMessage}`;
              }
            })
          )
        })
      ]
    });
  }

  info(params) {
    this._instance.info(params);
  }

  debug(params) {
    this._instance.debug(params);
  }

  warn(params) {
    this._instance.warn(params);
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
