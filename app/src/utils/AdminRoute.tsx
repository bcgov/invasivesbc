import React, { useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import AccessDenied from '../pages/misc/AccessDenied';
interface IAdminRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  roles: string[];
  title: string;
  componentProps?: any;
}

/**
 * An AdminRoute only allows a user who has the role of "Master Administrator".
 *
 * @param {*} props properties {component, layout, ...rest}
 * @return {*}
 */
const AdminRoute: React.FC<IAdminRouteProps> = (props) => {
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  let { component: Component, layout: Layout, ...rest } = props;
  const { userInfoLoaded, keycloak, userRoles } = props.componentProps;

  document.title = props.title;

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  useEffect(() => {
    const isAuthenticated = () => {
      return (isMobile() && userInfoLoaded) || keycloak?.obj?.authenticated;
    };

    if (userInfoLoaded) {
      if (userRoles.length > 0 && isAuthenticated()) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    }
  }, [userInfoLoaded, userRoles.length, keycloak?.obj?.authenticated]);

  return (
    <Route
      {...rest}
      render={(renderProps) => {
        return (
          <>
            {isAuthorized && (
              <Layout>
                <Component {...renderProps} {...props.componentProps} />
              </Layout>
            )}
            {!isAuthorized && <AccessDenied />}
          </>
        );
      }}
    />
  );
};

export default AdminRoute;
