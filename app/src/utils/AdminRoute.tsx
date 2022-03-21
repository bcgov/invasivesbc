import React, { useEffect, useContext } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import AccessDenied from '../pages/misc/AccessDenied';
import { ErrorContext } from 'contexts/ErrorContext';
import { ErrorBanner } from '../components/error/ErrorBanner';
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
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  let { component: Component, layout: Layout, ...rest } = props;
  const { userInfoLoaded, keycloak, userRoles } = props.componentProps;

  useEffect(() => {
    if (errorContext.hasErrors) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [errorContext.hasErrors, errorContext.errorArray]);

  document.title = props.title;

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  useEffect(() => {
    const isAuthenticated = () => {
      return (isMobile() && userInfoLoaded) || keycloak?.obj?.authenticated;
    };

    if (userInfoLoaded) {
      if (userRoles.length > 0 && isAuthenticated()) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    }
  }, [userInfoLoaded, userRoles.length, keycloak?.obj?.authenticated]);

  return (
    <Route
      {...rest}
      render={(renderProps) => {
        return (
          <>
            {isAuthorized && (
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
            {!isAuthorized && <AccessDenied />}
          </>
        );
      }}
    />
  );
};

export default AdminRoute;
