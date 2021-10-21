import { Network } from '@capacitor/network';
import { CircularProgress } from '@material-ui/core';
import React, { useEffect, useState, useContext } from 'react';
import { Redirect, Switch } from 'react-router-dom';
import HomeRouter from './features/home/HomeRouter';
import PublicLayout from './layouts/PublicLayout';
import AccessDenied from './pages/misc/AccessDenied';
import { NotFoundPage } from './pages/misc/NotFoundPage';
import AppRoute from './utils/AppRoute';
import { NetworkContext } from 'contexts/NetworkContext';

interface IAppRouterProps {
  deviceInfo: any;
  keycloak: any;
  keycloakConfig: any;
}

const AppRouter: React.FC<IAppRouterProps> = (props) => {
  const [layout, setLayout] = useState<React.FC<any>>(null);
  const [isMobileNoNetwork, setIsMobileNoNetwork] = useState(false);
  const networkContext = useContext(NetworkContext);

  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  const getMobileStatus = async () => {
    const status = await Network.getStatus();
    setIsMobileNoNetwork(status.connected);
  };

  useEffect(() => {
    getMobileStatus();
  }, []);

  useEffect(() => {
    // If on mobile and have no internet connection, then bypass keycloak
    // removed network check for now - can't use current version of capactior network as context
    setLayout(() => PublicLayout);
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
        layout={PublicLayout}
        isMobileNoNetwork={isMobileNoNetwork}
      />
      <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AppRouter;
