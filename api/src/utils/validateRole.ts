import { InvasivesRequest } from './auth-utils';
import createSecurityLog from './createSecurityLog';
import LoggerHandler from './endpoints/LoggerHandler';
import { Role } from 'constants/misc';

/**
 * @desc Parse security checks for roles, and compare against the requesting user.
 * @param apiSpec Specification for endpoint that contains the permitted roles
 * @param auth User Authentication
 * @returns {Boolean} User has any required role
 */
const verifyUserRole = (req: InvasivesRequest): boolean => {
  // Get the Roles defined in our APISpec for the targetted Method+Endpoint
  const requiredRoles = req.operationDoc?.security?.[0]?.Bearer;
  const roleNotRequired = !requiredRoles || requiredRoles.length === 0;
  if (roleNotRequired) return true;
  const userHasAccess = req.authContext.roles.some(
    ({ role_name }) => requiredRoles.includes(role_name) || role_name === Role.MASTER_ADMINISTRATOR
  );
  if (!userHasAccess) {
    new LoggerHandler(req?.route?.path).info(
      'User lacks sufficient role(s)',
      createSecurityLog(req, { eventType: 'unauthorized' }) as unknown as Record<PropertyKey, unknown>
    );
  }
  return userHasAccess;
};

export default verifyUserRole;
