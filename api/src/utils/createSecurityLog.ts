import { InvasivesRequest } from './auth-utils';

interface SecurityLog {
  ip: string;
  eventType?: 'unauthorized' | 'record_edit' | 'batch_upload' | 'successful_login';
}

interface Options {
  eventType?: SecurityLog['eventType'];
}
/**
 * @desc Parse Request Object create security log. Logs by default already contain high level user information + timestamps
 */
const createSecurityLog = (req: InvasivesRequest, options?: Options): SecurityLog => ({
  ip: req.ip,
  eventType: options?.eventType
});

export default createSecurityLog;
