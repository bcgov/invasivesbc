import React, { useContext } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { NetworkContext } from 'contexts/NetworkContext';
import { AuthStateContext } from 'contexts/authStateContext';
import { CircularProgress } from '@mui/material';
import { Capacitor } from '@capacitor/core';

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
  const { keycloak } = useContext(AuthStateContext);
  const networkContext = useContext(NetworkContext);
  const authStateContext = useContext(AuthStateContext);

  let { component: Component, layout: Layout, ...rest } = props;

  document.title = props.title;

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  const isAuthenticated = () => {
    return (!isMobile() && keycloak?.obj?.authenticated) || (isMobile() && authStateContext.userInfoLoaded);
  };

  return (
    <Route
      {...rest}
      render={(renderProps) => {
        if (process.env.REACT_APP_REAL_NODE_ENV !== 'production' && networkContext.connected) {
          if (!isAuthenticated()) {
            console.log('unauthenticated');
            return <Redirect to={{ pathname: '/forbidden', state: { referer: renderProps.location } }} />;
          }
        }
        return (
          <Layout>
            <Component {...renderProps} {...rest.componentProps} />
          </Layout>
        );
      }}
    />
  );
};

export default PrivateRoute;
