import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
interface IPublicRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  title: string;
  componentProps?: any;
}

/**
 * A PublicRoute only allows a user who is authenticated and has the appropriate role(s).
 *
 * @param {*} props properties {component, layout, ...rest}
 * @return {*}
 */
const PublicRoute: React.FC<IPublicRouteProps> = (props) => {
  let { component: Component, layout: Layout, ...rest } = props;
  document.title = props.title;

  return (
    <Route
      {...rest}
      render={(renderProps) => {
        return (
          <Layout>
            <Component {...renderProps} {...rest.componentProps} />
          </Layout>
        );
      }}
    />
  );
};

export default PublicRoute;
