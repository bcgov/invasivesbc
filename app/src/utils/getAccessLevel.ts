import { useSelector } from 'react-redux';
import { selectAuth } from 'state/reducers/auth';

export enum recordLevel {
  OWN = 'own',
  ALL = 'all',
  AGENCY = 'agency',
  EMPLOYER = 'employer',
  NONE = 'none'
}

export const GetUserAccessLevel = function (organizationId?, agencyId?) {
  let hasAnimalAccess = false;
  let hasPlantAccess = false;

  const authState = useSelector(selectAuth);

  if (authState.roles) {
    authState.roles.forEach((role) => {
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
