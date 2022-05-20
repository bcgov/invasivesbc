import React, { useEffect, useContext } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import AccessDenied from '../pages/misc/AccessDenied';
import { ErrorContext } from 'contexts/ErrorContext';
import { ErrorBanner } from '../components/error/ErrorBanner';
import { useSelector } from '../state/utilities/use_selector';
import { selectAuth } from '../state/reducers/auth';

interface IAdminRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  roles: string[];
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
  const errorContext = useContext(ErrorContext);
  const [hasErrors, setHasErrors] = React.useState(false);

  //@todo check role
  const { authenticated } = useSelector(selectAuth);

  let { component: Component, layout: Layout, ...rest } = props;

  useEffect(() => {
    if (errorContext.hasErrors) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [errorContext.hasErrors, errorContext.errorArray]);

  document.title = props.title;

  return (
    <Route
      {...rest}
      render={(renderProps) => {
        return (
          <>
            {authenticated && (
              <Layout>
                {hasErrors &&
                  errorContext.errorArray.map((error: any) => {
                    return (
                      <ErrorBanner
                        key={error.code.toString() + error.message + error.namespace}
                        code={error.code}
                        message={error.message}
                        namespace={error.namespace}
                      />
                    );
                  })}
                <Component {...renderProps} {...props.componentProps} />
              </Layout>
            )}
            {!authenticated && <AccessDenied />}
          </>
        );
      }}
    />
  );
};

export default AdminRoute;
