import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

export type IAppRouteProps = RouteProps & {
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  title: string;
  keycloak?: any;
  initConfig?: any;
};

const AppRoute: React.FC<IAppRouteProps> = ({
  component: Component,
  layout,
  title,
  keycloak,
  initConfig,
  ...rest
}) => {
  const Layout = layout === undefined ? (props: any) => <>{props.children}</> : layout;

  document.title = title;

  const layoutProps = {
    keycloak,
    initConfig
  };

  return (
    <Route
      {...rest}
      render={(props) => (
        <Layout { ...layoutProps } >
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

export default AppRoute;
