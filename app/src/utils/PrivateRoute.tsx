import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

interface IPrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  title: string;
  componentProps?: any;
}

/**
 * A PrivateRoute only allows a user who is authenticated and has the appropriate role(s) or claim(s).
 * @param props - Properties to pass { component, role, claim }
 */
const PrivateRoute: React.FC<IPrivateRouteProps> = (props) => {
  let { component: Component, layout: Layout, ...rest } = props;

  document.title = props.title;

  return (
    <Route
      {...rest}
      render={(props) => (
        <Layout>
          <Component {...props} {...rest.componentProps} />
        </Layout>
      )}
    />
  );
};

export default PrivateRoute;
