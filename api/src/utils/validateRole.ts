import { InvasivesRequest } from './auth-utils';
import createSecurityLog from './createSecurityLog';
import LoggerHandler from './endpoints/LoggerHandler';

type ApiDocWithSecurity = {
  security?: Array<Record<string, string[]>>;
};

/**
 * @desc Parse security checks for roles, and compare against the requesting user.
 * @param apiSpec Specification for endpoint that contains the permitted roles
 * @param auth User Authentication
 * @returns {Boolean} User has any required role
 */
const verifyUserRole = (apiDoc: ApiDocWithSecurity, req: InvasivesRequest): boolean => {
  const requiredRoles: Array<string> = apiDoc?.security?.[0]?.Bearer;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const userHasAccess = req.authContext.roles.some(({ role_name }) => requiredRoles.includes(role_name));
  if (!userHasAccess) {
    new LoggerHandler(req?.route?.path).info(
      'User lacks sufficient role(s)',
      createSecurityLog(req, { eventType: 'unauthorized' }) as unknown as Record<PropertyKey, unknown>
    );
  }
  return userHasAccess;
};

export default verifyUserRole;
