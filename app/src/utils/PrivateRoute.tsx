import { Capacitor } from '@capacitor/core';
import { AuthStateContext } from 'contexts/authStateContext';
import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext, useEffect } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
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
  const networkContext = useContext(NetworkContext);

  const [isAuthorized, setIsAuthorized] = React.useState(false);

  let { component: Component, layout: Layout, ...rest } = props;
  const { userInfoLoaded, keycloak, userRoles } = props.componentProps;

  document.title = props.title;
  console.log('authContext in privateRoute: ', props.componentProps);

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  const isAuthenticated = () => {
    return (isMobile() && userInfoLoaded) || keycloak?.obj?.authenticated;
  };

  useEffect(() => {
    if (userInfoLoaded) {
      if (userRoles.length > 0 && isAuthenticated()) {
        console.log('user is authorized: true');
        setIsAuthorized(true);
      } else {
        console.log('user is authorized: false');
        setIsAuthorized(false);
      }
    }
  }, [userInfoLoaded, keycloak.obj?.authenticated]);

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
