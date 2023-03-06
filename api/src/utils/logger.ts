import winston from 'winston';
import loggingConfig from '../loggingconfig.json'
import { authenticate, InvasivesRequest } from './auth-utils';
import { hrtime } from 'process';
/**
 * Logger input.
 *
 * @export
 * @interface ILoggerMessage
 * @extends {winston.Logform.TransformableInfo}
 */
export interface ILoggerMessage extends winston.Logform.TransformableInfo {
  timestamp?: string; // Optionally overwrite the default timestamp
  label?: string; // Add a label to this message (generally the name of the parent function)
  error?: Error; // An optional error to display
}

/**
 * Checks if the value provided is an object.
 *
 * @param {*} obj
 * @returns {boolean} True if the value is an object, false otherwise.
 */
const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && item.constructor.name === 'Object';
};

/**
 * Checks if the value provided is an object with enumerable keys (ignores symbols).
 *
 * @param {*} obj
 * @returns {boolean} True if the value is an object with enumerable keys, false otherwise.
 */
const isObjectWithkeys = (item: any): boolean => {
  return isObject(item) && !!Object.keys(item).length;
};

/**
 * Pretty stringify.
 *
 * @param {any} item
 * @return {*}  {string}
 */
const prettyPrint = (item: any): string => {
  return JSON.stringify(item, undefined, 2);
};

/**
 * Supported log data capture metrics.
 *
 * @export
 * @enum {string}
 */
export enum logMetrics {
  USER_METADATA = 'user-metadata',
  QUERY_STRING_PARAMS = 'query-string-params',
  REQUEST_BODY = 'request-body',
  REQUEST_TIME = 'request-time',
  RESPONSE_BODY = 'response-body',
  RESPONSE_TIME = 'response-time',
  SQL_QUERY_START_TIME = 'sql-query-start-time',
  SQL_QUERY_SOURCE = 'sql-query-source',
  SQL_PARAMS = 'sql-params',
  SQL_RESULTS = 'sql-results',
  SQL_RESPONSE_TIME = 'sql-response-time',
  LABEL_DATA = 'label-data',
  ERRORS = 'errors',
}
/**
 * Get or create a logger for the given logLabel.
 *
 * Centralized logger that uses Winston 3.x.
 *
 * Initializing the logger:
 *
 * import { getLogger } from './logger';
 * const defaultLog = getLogger('class-or-file-name');
 *
 * Usage:
 *
 * log.info({ message: 'A basic log message!' })
 *
 * log.info({ label: 'functionName', message: 'A message with a label!' })
 *
 * log.error({ label: 'functionName', message: 'An error message!:', error })
 *
 * log.debug({ label: 'functionName', message: 'A debug message!:', debugInfo1, debugInfo2 })
 *
 * ...etc
 *
 * Example Output:
 *
 * [15-09-2019 14:44:30] [info] (class-or-file-name): A basic log message!
 *
 * [15-09-2019 14:44:30] [info] (class-or-file-name): functionName - A message with a label!
 *
 * [02-12-2019 14:45:02] [error] (class-or-file-name): functionName - An error message!
 * {
 *   error: 404 Not Found
 * }
 *
 * [02-12-2019 14:46:15] [error] (class-or-file-name): functionName - A debug message!
 * {
 *   debugInfo1: 'someDebugInfo1'
 * }
 * {
 *   debugInfo2: 'someDebugInfo2'
 * }
 *
 * ...etc
 *
 * Valid `LOG_LEVEL` values (from least logging to most logging) (default: info):
 * error, warn, info, debug
 *
 * @param {string} logLabel common label for the instance of the logger.
 * @returns
 */
const getLogger = function (logLabel: string) {
  return winston.loggers.get(logLabel || 'default', {
    transports: [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'debug',
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, label, message, error, ...other }: ILoggerMessage) => {
            const optionalLabel = (label && ` ${label} -`) || '';

            const logMessage = (message && ((isObject(message) && `${prettyPrint(message)}`) || message)) || '';

            const optionalError =
              (error && ((isObjectWithkeys(error) && `\n${prettyPrint(error)}`) || `\n${error}`)) || '';

            const optionalOther =
              (other && isObjectWithkeys(other) && `\n${JSON.stringify(other, undefined, 2)}`) || '';

            return `[${timestamp}] (${level}) (${logLabel}):${optionalLabel} ${logMessage} ${optionalError} ${optionalOther}`;
          })
        )
      })
    ]
  });
};

/**
 * Calculates the duration in milliseconds. Format helper.
 *
 * @param {[number,number]} diff
 * @returns {number} Returns the duration in milliseconds.
 */

const getDurationInMilliseconds = (diff:[number,number]):number => (diff[0] * 1e9 + diff[1]) / 1e6;

const padL = (dt) => ('0' + dt).slice(-2);
const formatDate = (dt: Date): string => `${padL(dt.getHours())}:${padL(dt.getMinutes())}:${padL(dt.getSeconds())}:${dt.getMilliseconds()} ${padL(dt.getDate())}-${padL(dt.getMonth()+1)}-${dt.getFullYear()}`;
const formatResTimeMsg = (event: string, dt: Date, duration: string): string => `${event}: ${formatDate(dt)} ${duration} ms`;

const loggingHandler = (isAuthd: boolean = false) => (req: any, res: any): void => {
  const endpoint = req.url.split('/')[2];
  const endpointConfigObj = loggingConfig.endpoint_configs[endpoint];
  const logger = getLogger(endpoint);
    
  if(endpointConfigObj) {
    // console.log('endpoint',endpoint);
    // console.log('endpointConfigObj',endpointConfigObj);
    if(isAuthd)
    {
      //user metadata
      if(endpointConfigObj?.[logMetrics.USER_METADATA])
      {
        const token = req.keycloakToken;
        const authContext = req.authContext;
        // console.log('authContext',authContext);
        const metadata = {
          'token': token,
          'auth': authContext
        }
        if (token && authContext) {
          logger.log({
            level: 'debug',
            message: 'USR-META:',
            metadata
          });
        } else {
          logger.log({
            level: 'warn',
            message: 'USR-META: There is a problem with either token or AuthContext'
          });
        }
      }
    }

      //query string params
    if(endpointConfigObj?.[logMetrics.QUERY_STRING_PARAMS])
    {
      if (req.query?.query && req.query.query !== 'undefined') {
        const query = req.query.query;
        logger.log({
          level: 'debug',
          message: 'QRY-STR-PRMS:',
          query: JSON.parse(query)
        });
      } else {
        logger.log({
          level: 'warn',
          message: 'QRY-STR-PRMS: There are no query parameters.'
        });
      }
    }
    
    // req body
    if(endpointConfigObj?.[logMetrics.REQUEST_BODY])
    {
      const body = req.body;
      if (body && JSON.stringify(body) !== '{}') {
        logger.log({
          level: 'debug',
          message: 'REQ-BODY:',
          body
        });
      } else {
        logger.log({
          level: 'warn',
          message: `REQ-BODY: Body is empty.`
        })
      }
    }
    
    if(endpointConfigObj?.[logMetrics.REQUEST_TIME])
    {
      logger.log({
        level: 'debug',
        message: `${req.method} REQ-TIME: ${formatDate(new Date())} USER: ${req.authContext.friendlyUsername}`
      }); 
    }

    if(endpointConfigObj?.[logMetrics.RESPONSE_BODY])
    {
      const body = res.body;
      if (body && JSON.stringify(body) !== '{}') {
        logger.log({
          level: 'debug',
          message: 'RES-BODY:',
          body
        });
      } else {
        logger.log({
          level: 'warn',
          message: `RES-BODY: Body is empty.`
        })
      }
    }
    // 
    if(endpointConfigObj?.[logMetrics.RESPONSE_TIME])
    {
      const start = hrtime();
      res.on('finish', () => {
          const durationInMilliseconds = getDurationInMilliseconds(hrtime(start));

          logger.log({
            level: 'debug',
            message: formatResTimeMsg('RES-T-FINISHED',new Date(), durationInMilliseconds.toLocaleString())
          }); 

      })
    
      res.on('close', () => {
          const durationInMilliseconds = getDurationInMilliseconds(hrtime(start));

          logger.log({
            level: 'debug',
            message: formatResTimeMsg('RES-T-CLOSE',new Date(), durationInMilliseconds.toLocaleString())
          }); 
      })
    }
  }

}

const logEndpoint = (isAuthd: boolean = false) => (req: InvasivesRequest, res: unknown) =>
{
  // const authContext = (req as any)?.authContext;
  // const isAuth = (req as any)?.authContext?.isAuth ?? isAuthd;
  loggingHandler((req as any)?.authContext?.isAuth ?? isAuthd)(req, res);
  // if (isAuthd) {
  // loggingAuthd(req, res);
  // }
  // loggingPublic(req, res);
}
const logDataPoint = (endpoint: string, msg: unknown) => {

}
export { logEndpoint, logDataPoint };
