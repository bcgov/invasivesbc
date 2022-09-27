import AccessDenied from 'pages/misc/AccessDenied';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from 'state/reducers/auth';
import { selectUserInfo } from 'state/reducers/userInfo';
import { AccessLevel } from '../AppRouter';

interface ICheckAccessProps {
  children: any;
  accessLevel: AccessLevel;
}
const CheckAcces: React.FC<ICheckAccessProps> = (props: ICheckAccessProps) => {
  const { children, accessLevel } = props;
  const { authenticated, roles } = useSelector(selectAuth);
  const { activated } = useSelector(selectUserInfo);

  /**
   * Check if the user has the required access level to view the page.
   * @returns true if the user has the required access level
   */
  const accessGranted = () => {
    try {
      switch (accessLevel) {
        case AccessLevel.PUBLIC:
          return true;
        case AccessLevel.USER:
          return authenticated && activated;
        case AccessLevel.ADMIN:
          return authenticated && activated && roles.some((role) => role.role_name === 'master_administrator');
        default:
          return false;
      }
    } catch (e) {
      console.error('Error: Access level could not be validated at this time.');
      console.error(e);
    }
  };

  return <>{accessGranted() ? children : AccessDenied}</>;
};

export default CheckAcces;
