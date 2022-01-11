import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
interface IAdminRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  title: string;
  componentProps?: any;
}

// TODO: Fetch the current user's role on mount

/**
 * An AdminRoute only allows a user who has the role of "Master Administrator".
 *
 * @param {*} props properties {component, layout, ...rest}
 * @return {*}
 */
const AdminRoute: React.FC<IAdminRouteProps> = (props) => {
  let { component: Component, layout: Layout, ...rest } = props;
  document.title = props.title;

  return (
    <Route
      {...rest}
      render={(renderProps) => {
        // TODO: If current user is not master admin, redirect to forbidden page
        return (
          <Layout>
            <Component {...renderProps} {...rest.componentProps} />
          </Layout>
        );
      }}
    />
  );
};

export default AdminRoute;
