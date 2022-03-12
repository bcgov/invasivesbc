import { Capacitor } from '@capacitor/core';
import React, { useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import AccessDenied from '../pages/misc/AccessDenied';

interface IPrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  roles: string[];
  title: string;
  componentProps?: any;
}

/**
 * A PrivateRoute only allows a user who is authenticated and has the appropriate role(s).
 *
 * @param {*} props properties {component, layout, ...rest}
 * @return {*}
 */
const PrivateRoute: React.FC<IPrivateRouteProps> = (props) => {
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
  }, [userInfoLoaded, keycloak.obj?.authenticated, userRoles.length]);

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

export default PrivateRoute;
