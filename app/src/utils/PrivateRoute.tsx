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
 * A PrivateRoute only allows a user who is authenticated and has the appropriate role(s) or claim(s).
 * @param props - Properties to pass { component, role, claim }
 */
const PrivateRoute: React.FC<IPrivateRouteProps> = (props) => {
  const keycloak = useKeycloakWrapper();

  let { component: Component, layout: Layout, ...rest } = props;

  document.title = props.title;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!keycloak.obj?.authenticated || !rest.roles || !keycloak.hasRole(rest.roles)) {
          return <Redirect to={{ pathname: '/forbidden', state: { referer: props.location } }} />;
        } else {
          return (
            <Layout>
              <Component {...props} {...rest.componentProps} />
            </Layout>
          );
        }
      }}
    />
  );
};

export default PrivateRoute;
