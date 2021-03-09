import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

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

  let { component: Component, layout: Layout, ...rest } = props;

  document.title = props.title;

  return (
    <Route
      {...rest}
      render={(renderProps) => {
        if ((!keycloak.obj?.authenticated || !rest.roles || !keycloak.hasRole(rest.roles)) && !props.componentProps?.isMobileNoNetwork) {
          return <Redirect to={{ pathname: '/forbidden', state: { referer: renderProps.location } }} />;
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
