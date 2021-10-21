import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import React, { useContext } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { NetworkContext } from 'contexts/NetworkContext';
import { AuthStateContext } from 'contexts/authStateContext';
import { CircularProgress } from '@material-ui/core';

interface IPublicRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  title: string;
  componentProps?: any;
}

/**
 * A PublicRoute only allows a user who is authenticated and has the appropriate role(s).
 *
 * @param {*} props properties {component, layout, ...rest}
 * @return {*}
 */
const PublicRoute: React.FC<IPublicRouteProps> = (props) => {
  let { component: Component, layout: Layout, ...rest } = props;
  const { keycloak } = useContext(AuthStateContext);

  if (keycloak?.obj?.authenticated && !keycloak?.userInfo) {
    return <CircularProgress />;
  }

  document.title = props.title;

  return (
    <Route
      {...rest}
      render={(renderProps) => {
        return (
          <Layout>
            <Component {...renderProps} {...rest.componentProps} />
          </Layout>
        );
      }}
    />
  );
};

export default PublicRoute;
