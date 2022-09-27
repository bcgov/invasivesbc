import React, { useEffect } from 'react';
import { Redirect, Switch, useHistory } from 'react-router-dom';
import HomeRouter from './features/home/HomeRouter';
import PublicLayout from './utils/PublicLayout';
import AccessDenied from './pages/misc/AccessDenied';
import { NotFoundPage } from './pages/misc/NotFoundPage';
import AppRoute from './utils/AppRoute';
import { useSelector } from './state/utilities/use_selector';
import { selectConfiguration } from './state/reducers/configuration';
import NewAppRoute from './router/NewAppRoute';
import LandingPage from 'features/home/landing/LandingPage';

interface IAppRouterProps {
  deviceInfo: any;
}

export enum AccessLevel {
  PUBLIC = 'PUBLIC',
  USER = 'USER',
  ADMIN = 'ADMIN'
}

const AppRouter: React.FC<IAppRouterProps> = (props) => {
  const { DEBUG } = useSelector(selectConfiguration);
  const { location } = useHistory();

  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  useEffect(() => {
    if (DEBUG) {
      console.log(`Route: ${location.pathname}${location.search}, State: ${JSON.stringify(location.state)}`);
    }
  }, [location.pathname, location.search, location.state, DEBUG]);

  return (
    <Switch>
      <Redirect exact from="/" to="/home/landing" />
      <AppRoute path="/forbidden" title={getTitle('Forbidden')} component={AccessDenied} layout={PublicLayout} />
      <AppRoute path="/page-not-found" title={getTitle('Not Found')} component={NotFoundPage} layout={PublicLayout} />
      <AppRoute path="/home" title={getTitle('Home')} component={HomeRouter} layout={PublicLayout} />
      {/* <NewAppRoute
        accessLevel={AccessLevel.PUBLIC}
        path="/home/landing"
        title={getTitle('Landing')}
        component={LandingPage}
      /> */}
      <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AppRouter;
