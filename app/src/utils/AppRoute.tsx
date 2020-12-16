import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

export type IAppRouteProps = RouteProps & {
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  title: string;
  keycloak?: any;
  keycloakConfig?: any;
};

const AppRoute: React.FC<IAppRouteProps> = ({
  component: Component,
  layout,
  title,
  keycloak,
  keycloakConfig,
  ...rest
}) => {
  const Layout = layout === undefined ? (props: any) => <>{props.children}</> : layout;

  document.title = title;

  return (
    <Route
      {...rest}
      render={(props) => (
        <Layout keycloak={keycloak} keycloakConfig={keycloakConfig}>
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

export default AppRoute;
