import React, { useContext } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { AuthStateContext } from '../contexts/authStateContext';
import { Redirect } from 'react-router';
interface IAdminRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  title: string;
  componentProps?: any;
}

/**
 * An AdminRoute only allows a user who has the role of "Master Administrator".
 *
 * @param {*} props properties {component, layout, ...rest}
 * @return {*}
 */
const AdminRoute: React.FC<IAdminRouteProps> = (props) => {
  const authContext = useContext(AuthStateContext);

  let { component: Component, layout: Layout, ...rest } = props;
  document.title = props.title;

  if (authContext.userInfoLoaded && authContext.hasRole('master_administrator')) {
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
  } else {
    return <Route {...rest} render={() => <Redirect to="/forbidden" />} />;
  }
};

export default AdminRoute;
