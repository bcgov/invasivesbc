import React, { useContext, useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import AccessDenied from '../pages/misc/AccessDenied';
import { ErrorContext } from 'contexts/ErrorContext';
import { ErrorBanner } from '../components/error/ErrorBanner';
import { useSelector } from '../state/utilities/use_selector';
import { selectAuth } from '../state/reducers/auth';

interface IPrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  roles: string[];
  title: string;
  componentProps?: any;
}

/**
 * A PrivateRoute only allows a user who is authenticated and has the appropriate role(s).
 *
 * @param {*} props properties {component, layout, ...rest}
 * @return {*}
 */
const PrivateRoute: React.FC<IPrivateRouteProps> = (props) => {
  const errorContext = useContext(ErrorContext);
  const [hasErrors, setHasErrors] = React.useState(false);

  let { component: Component, layout: Layout, ...rest } = props;
  const { authenticated } = useSelector(selectAuth);

  document.title = props.title;

  useEffect(() => {
    if (errorContext.hasErrors) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [errorContext.hasErrors, errorContext.errorArray]);

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

export default PrivateRoute;
