type UserRole = {
  role_id: number;
  role_name: string;
  role_description: string;
};
/**
 * @desc Check users token for auth credential
 * @param req User Request
 * @param authRoles List of role_name suitable for given check
 * @returns user has access rights
 */
const isAdminFromAuthContext = (req: any, authRoles: string[] = ['master_administrator']): boolean => {
  return req?.authContext?.roles.some((role: UserRole) => authRoles.includes(role.role_name));
};

export default isAdminFromAuthContext;
