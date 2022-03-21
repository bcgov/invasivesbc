import { Capacitor } from '@capacitor/core';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext, useEffect } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import AccessDenied from '../pages/misc/AccessDenied';
import { ErrorContext } from 'contexts/ErrorContext';
import { ErrorBanner } from '../components/error/ErrorBanner';

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

  const [isAuthorized, setIsAuthorized] = React.useState(false);

  let { component: Component, layout: Layout, ...rest } = props;
  const { userInfoLoaded, keycloak, userRoles } = props.componentProps;

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
  }, [userInfoLoaded, keycloak.obj?.authenticated, userRoles.length]);

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

export default PrivateRoute;
