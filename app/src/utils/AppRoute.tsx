import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

export type IAppRouteProps = RouteProps & {
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  title: string;
  props?: any;
};

const AppRoute: React.FC<IAppRouteProps> = ({ component: Component, layout, title, props, ...rest }) => {
  const Layout = layout === undefined ? (props: any) => <>{props.children}</> : layout;
  document.title = title;
  console.log('PROPS IN APPROUTE: ', props);
  return (
    <Route
      {...rest}
      render={() => (
        // PUBLICLAYOUT
        <Layout>
          {/* HOMEROUTER GETS CLASSES PROP FROM PUBLICLAYOUT AFTER CLONE */}
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

export default AppRoute;
