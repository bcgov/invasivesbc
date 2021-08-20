import { Capacitor } from '@capacitor/core';
import { CircularProgress } from '@material-ui/core';
import HomeRouter from './features/home/HomeRouter';
import AuthLayout from './layouts/AuthLayout';
import PublicLayout from './layouts/PublicLayout';
import AccessDenied from './pages/misc/AccessDenied';
import { NotFoundPage } from './pages/misc/NotFoundPage';
import React, { useEffect, useState } from 'react';
import { Redirect, Switch } from 'react-router-dom';
import AppRoute from './utils/AppRoute';

interface IAppRouterProps {
  deviceInfo: any;
  keycloak: any;
  keycloakConfig: any;
}

const AppRouter: React.FC<IAppRouterProps> = (props) => {
  const [layout, setLayout] = useState<React.FC<any>>(null);
  const [isMobileNoNetwork, setIsMobileNoNetwork] = useState(false);

  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  useEffect(() => {
    // If on mobile and have no internet connection, then bypass keycloak
    // removed network check for now - can't use current version of capactior network as context
    if (Capacitor.getPlatform() === 'ios') {
      setLayout(() => PublicLayout);
      setIsMobileNoNetwork(true);
    } else {
      setLayout(() => AuthLayout);
    }
  });

  if (!layout) {
    return <CircularProgress />;
  }

  return (
    <Switch>
      <Redirect exact from="/" to="/home" />
      <AppRoute path="/forbidden" title={getTitle('Forbidden')} component={AccessDenied} layout={PublicLayout} />
      <AppRoute path="/page-not-found" title={getTitle('Not Found')} component={NotFoundPage} layout={PublicLayout} />
      <AppRoute
        path="/home"
        title={getTitle('Home')}
        component={HomeRouter}
        layout={layout}
        keycloak={props.keycloak}
        keycloakConfig={props.keycloakConfig}
        isMobileNoNetwork={isMobileNoNetwork}
      />
      <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AppRouter;
