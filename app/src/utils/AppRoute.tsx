import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

export type IAppRouteProps = RouteProps & {
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  protected?: boolean;
  title: string;
  keycloak?: any;
  initConfig?: any;
  componentProps?: any;
};

const AppRoute: React.FC<IAppRouteProps> = ({
  component: Component,
  layout,
  protected: usePrivateRoute,
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
          <Component {...props} {...rest.componentProps} />
        </Layout>
      )}
    />
  );
};

export default AppRoute;
