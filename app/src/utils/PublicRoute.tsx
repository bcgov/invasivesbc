import React, { useContext, useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { ErrorContext } from 'contexts/ErrorContext';
import { ErrorBanner } from '../components/error/ErrorBanner';
interface IPublicRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  title: string;
  componentProps?: any;
}

/**
 * A PublicRoute does not restrict based on authentication status.
 *
 * @param {*} props properties {component, layout, ...rest}
 * @return {*}
 */
const PublicRoute: React.FC<IPublicRouteProps> = (props) => {
  const errorContext = useContext(ErrorContext);
  const [hasErrors, setHasErrors] = React.useState(false);
  let { component: Component, layout: Layout, ...rest } = props;
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
            <Component {...renderProps} {...rest.componentProps} />
          </Layout>
        );
      }}
    />
  );
};

export default PublicRoute;
