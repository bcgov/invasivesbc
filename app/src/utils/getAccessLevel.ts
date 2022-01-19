import { AuthStateContext } from 'contexts/authStateContext';
import { useContext } from 'react';

export enum recordLevel {
  OWN = 'own',
  ALL = 'all',
  AGENCY = 'agency',
  EMPLOYER = 'employer',
  NONE = 'none'
}

export const GetUserAccessLevel = function (organizationId?, agencyId?) {
  const { userRoles } = useContext(AuthStateContext);
  let hasAnimalAccess = false;
  let hasPlantAccess = false;
  if (userRoles) {
    userRoles.forEach((role) => {
      if (
        role.role_name.includes('animals') ||
        role.role_name.includes('both') ||
        (role.role_name.includes('admin') && !role.role_name.includes('administrator'))
      ) {
        hasAnimalAccess = true;
      }
      if (
        role.role_name.includes('plants') ||
        role.role_name.includes('both') ||
        (role.role_name.includes('admin') && !role.role_name.includes('administrator'))
      ) {
        hasPlantAccess = true;
      }
    });
  }
  return { hasPlantAccess, hasAnimalAccess };
};
