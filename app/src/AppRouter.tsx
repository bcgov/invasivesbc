import {Network} from '@capacitor/network';
import CircularProgress from '@mui/material/CircularProgress';
import AdminRouter from 'features/admin/AdminRouter';
import React, {useContext, useEffect, useState} from 'react';
import {Redirect, Switch} from 'react-router-dom';
import HomeRouter from './features/home/HomeRouter';
import PublicLayout from './layouts/PublicLayout';
import AccessDenied from './pages/misc/AccessDenied';
import {NotFoundPage} from './pages/misc/NotFoundPage';
import AppRoute from './utils/AppRoute';

interface IAppRouterProps {
  deviceInfo: any;
}

const AppRouter: React.FC<IAppRouterProps> = (props) => {
  const [layout, setLayout] = useState<React.FC<any>>(null);

  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  if (!layout) {
    return <CircularProgress/>;
  }

  return (
    <Switch>
      <Redirect exact from="/" to="/home/landing"/>
      <AppRoute path="/forbidden" title={getTitle('Forbidden')} component={AccessDenied} layout={PublicLayout}/>
      <AppRoute path="/page-not-found" title={getTitle('Not Found')} component={NotFoundPage} layout={PublicLayout}/>
      <AppRoute
        path="/home"
        title={getTitle('Home')}
        component={HomeRouter}
        layout={PublicLayout}
      />
      <AppRoute
        path="/admin"
        title={getTitle('Admin')}
        component={AdminRouter}
        layout={PublicLayout}
      />
      <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found"/>}/>
    </Switch>
  );
};

export default AppRouter;
