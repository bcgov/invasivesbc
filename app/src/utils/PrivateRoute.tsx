import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import React, { useContext } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { NetworkContext } from 'contexts/NetworkContext';

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
  const keycloak = useKeycloakWrapper();
  const networkContext = useContext(NetworkContext);
  let { component: Component, layout: Layout, ...rest } = props;

  document.title = props.title;

  // needs a clean solution to having some public pages
  return (
    <Route
      {...rest}
      render={(renderProps) => {
        if (process.env.REACT_APP_REAL_NODE_ENV !== 'production' && networkContext.connected) {
          if (
            (!keycloak.obj?.authenticated || !rest.roles || !keycloak.hasRole(rest.roles)) &&
            !props.componentProps?.isMobileNoNetwork
          ) {
            console.log('unauthenticated');
            return <Redirect to={{ pathname: '/forbidden', state: { referer: renderProps.location } }} />;
          } else {
            console.log('authenticated');
            return (
              <Layout>
                <Component {...renderProps} {...rest.componentProps} />
              </Layout>
            );
          }
        } else {
          return (
            <Layout>
              <Component {...renderProps} {...rest.componentProps} />
            </Layout>
          );
        }
      }}
    />
  );
};

export default PrivateRoute;
