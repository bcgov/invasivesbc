import HomeRouter from 'features/home/HomeRouter';
import AuthLayout from 'layouts/AuthLayout';
import PublicLayout from 'layouts/PublicLayout';
import AccessDenied from 'pages/misc/AccessDenied';
import { NotFoundPage } from 'pages/misc/NotFoundPage';
import React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import AppRoute from 'utils/AppRoute';

interface IAppRouterProps {
  deviceInfo: any;
  keycloak: any;
  initConfig: any;
}

const AppRouter: React.FC<IAppRouterProps> = (props) => {
  console.log('hey props', props);

  const layout = props.deviceInfo ? PublicLayout : AuthLayout;

  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  return (
    <Switch>
      <Redirect exact from="/" to="/home" />
      <AppRoute
        path="/forbidden"
        title={getTitle('Forbidden')}
        component={AccessDenied}
        layout={PublicLayout}
      />
      <AppRoute
        path="/page-not-found"
        title={getTitle('Page Not Found')}
        component={NotFoundPage}
        layout={PublicLayout}
      />
      <AppRoute path="/home" component={HomeRouter} layout={layout} title={getTitle('Home')} keycloak={props.keycloak} initConfig={props.initConfig} />
      <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AppRouter;
