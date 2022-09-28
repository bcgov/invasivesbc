import AdminRouter from 'features/admin/AdminRouter';
import React, { useEffect, useState } from 'react';
import { Redirect, Switch, useHistory } from 'react-router-dom';
import HomeRouter from './features/home/HomeRouter';
import PublicLayout from './layouts/PublicLayout';
import AccessDenied from './pages/misc/AccessDenied';
import { NotFoundPage } from './pages/misc/NotFoundPage';
import AppRoute from './utils/AppRoute';
import { useSelector } from './state/utilities/use_selector';
import { selectConfiguration } from './state/reducers/configuration';
import { createTheme, ThemeOptions, ThemeProvider } from '@mui/material';
import { getDesignTokens } from 'utils/CustomThemeProvider';
import { selectUserSettings } from 'state/reducers/userSettings';

interface IAppRouterProps {
  deviceInfo: any;
  keycloak: any;
  keycloakConfig: any;
}

const AppRouter: React.FC<IAppRouterProps> = (props) => {
  const { DEBUG } = useSelector(selectConfiguration);
  const { location } = useHistory();
  const { themeMode } = useSelector(selectUserSettings);

  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  useEffect(() => {
    if (DEBUG) {
      console.log(`Route: ${location.pathname}${location.search}, State: ${JSON.stringify(location.state)}`);
    }
  }, [location.pathname, location.search, location.state, DEBUG]);

  const theme = createTheme(getDesignTokens(themeMode) as ThemeOptions);

  return (
    <ThemeProvider theme={theme}>
      <Switch>
        <Redirect exact from="/" to="/home/landing" />
        <AppRoute path="/forbidden" title={getTitle('Forbidden')} component={AccessDenied} layout={PublicLayout} />
        <AppRoute path="/page-not-found" title={getTitle('Not Found')} component={NotFoundPage} layout={PublicLayout} />
        <AppRoute path="/home" title={getTitle('Home')} component={HomeRouter} layout={PublicLayout} />
        <AppRoute path="/admin" title={getTitle('Admin')} component={AdminRouter} layout={PublicLayout} />
        <AppRoute title="*" path="*" component={() => <Redirect to="/page-not-found" />} />
      </Switch>
    </ThemeProvider>
  );
};

export default AppRouter;
