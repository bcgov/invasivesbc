import { InvasivesRequest } from './auth-utils';

type ApiDocWithSecurity = {
  security?: Array<Record<string, string[]>>;
};

/**
 * @desc Parse security checks for roles, and compare against the requesting user.
 * @param apiSpec Specification for endpoint that contains the permitted roles
 * @param auth User Authentication
 * @returns {Boolean} User has any required role
 */
const verifyUserRole = (apiDoc: ApiDocWithSecurity, auth: InvasivesRequest): boolean => {
  const requiredRoles: Array<string> = apiDoc?.security?.[0]?.Bearer;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return auth.authContext.roles.some(({ role_name }) => requiredRoles.includes(role_name));
};

export default verifyUserRole;
