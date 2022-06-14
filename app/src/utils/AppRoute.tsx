import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

export type IAppRouteProps = RouteProps & {
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  title: string;
  props?: any;
};

const AppRoute: React.FC<IAppRouteProps> = ({
  component: Component,
  layout,
  title,
  props,
  ...rest
}) => {
  const Layout = layout === undefined ? (props: any) => <>{props.children}</> : layout;
  document.title = title;
  return (
    <Route
      {...rest}
      render={() => (
        <Layout>
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

export default AppRoute;
