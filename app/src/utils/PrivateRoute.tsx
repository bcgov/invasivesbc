import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import React from 'react';
import { Redirect, Route, RouteProps, useLocation } from 'react-router-dom';

interface IPrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  componentProps?: any;
}

/**
 * A PrivateRoute only allows a user who is authenticated and has the appropriate role(s) or claim(s).
 * @param props - Properties to pass { component, role, claim }
 */
const PrivateRoute: React.FC<IPrivateRouteProps> = (props) => {
  const location = useLocation();
  const keycloak = useKeycloakWrapper();

  let { component: Component, layout: Layout, ...rest } = props;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!!keycloak.obj?.authenticated) {
          return (
            <Layout>
              <Component {...props} {...rest.componentProps} />
            </Layout>
          );
        } else {
          if (props.location.pathname !== '/login') {
            const redirectTo = encodeURI(`${location.pathname}${location.search}`);
            return <Redirect to={`/login?redirect=${redirectTo}`} />;
          }
        }
      }}
    />
  );
};

export default PrivateRoute;
