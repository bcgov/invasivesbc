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
  const { userRoles, setUserRoles } = useContext(AuthStateContext);
  let hasAnimalAccess = false;
  let hasPlantAccess = false;
  if (userRoles) {
    userRoles.forEach((role) => {
      if (
        role.includes('animals') ||
        role.includes('both') ||
        (role.includes('admin') && !role.includes('administrator'))
      ) {
        console.log('Got an animal match: ', role);
        hasAnimalAccess = true;
      }
      if (
        role.includes('plants') ||
        role.includes('both') ||
        (role.includes('admin') && !role.includes('administrator'))
      ) {
        console.log('Got a plant match: ', role);
        hasPlantAccess = true;
      }
    });
  }
  return { hasPlantAccess, hasAnimalAccess };
};
