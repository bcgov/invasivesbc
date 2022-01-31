import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

export type IAppRouteProps = RouteProps & {
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  title: string;
  keycloak?: any;
  keycloakConfig?: any;
  props?: any;
  isMobileNoNetwork?: boolean;
};

const AppRoute: React.FC<IAppRouteProps> = ({
  component: Component,
  layout,
  title,
  keycloak,
  keycloakConfig,
  props,
  isMobileNoNetwork,
  ...rest
}) => {
  const Layout = layout === undefined ? (props: any) => <>{props.children}</> : layout;
  document.title = title;
  return (
    <Route
      {...rest}
      render={() => (
        <Layout keycloak={keycloak} keycloakConfig={keycloakConfig} isMobileNoNetwork={isMobileNoNetwork}>
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

export default AppRoute;
