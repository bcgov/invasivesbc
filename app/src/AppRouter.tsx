import React, { useEffect, lazy, Suspense } from 'react';
import { Redirect, Switch, useHistory } from 'react-router-dom';
import AccessDenied from './pages/misc/AccessDenied';
import { NotFoundPage } from './pages/misc/NotFoundPage';
import { useSelector } from './state/utilities/use_selector';
import { selectConfiguration } from './state/reducers/configuration';
import AppRoute from './router/AppRoute';

import { createTheme, ThemeOptions, ThemeProvider } from '@mui/material';
import { getDesignTokens } from 'utils/CustomThemeProvider';
import { selectUserSettings } from 'state/reducers/userSettings';
import { CssBaseline } from '@mui/material';
import LandingPage from './features/home/landing/LandingPage';

const MapPage = lazy(() => import('features/home/map/MapPage'));
const AccessRequestPage = lazy(() => import('features/home/accessRequest/AccessRequestPage'));
const DataSharingAgreementPage = lazy(() => import('features/home/dataSharingAgreement/DataSharingAgreementPage'));
const BulkEditActivitiesPage = lazy(() => import('features/home/search/BulkEditActivitiesPage'));
const ObservationCreationStepperPage = lazy(() => import('features/home/activity/ObservationCreationStepperPage'));
const PlanPage = lazy(() => import('features/home/plan/PlanPage'));
const ActivitiesPage = lazy(() => import('features/home/activities/ActivitiesPage'));
const ActivityPage = lazy(() => import('features/home/activity/ActivityPage'));
const EmbeddedReportsPage = lazy(() => import('features/home/reports/EmbeddedReportsPage'));
const ReferenceIAPPSitePage = lazy(() => import('features/home/references/ReferenceIAPPSitePage'));
const UserAccessPage = lazy(() => import('./features/admin/userAccess/UserAccessPage'));

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
  const { darkTheme } = useSelector(selectUserSettings);

  const theme = createTheme(getDesignTokens(darkTheme) as ThemeOptions);
  console.log('THEME:', theme);
  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  useEffect(() => {
    if (DEBUG) {
      console.log(`Route: ${location.pathname}${location.search}, State: ${JSON.stringify(location.state)}`);
    }
  }, [location.pathname, location.search, location.state, DEBUG]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Redirect exact from="/" to="/home/landing" />
        <AppRoute
          accessLevel={AccessLevel.PUBLIC}
          path="/forbidden"
          title={getTitle('Forbidden')}
          component={AccessDenied}
        />
        <AppRoute
          accessLevel={AccessLevel.PUBLIC}
          path="/page-not-found"
          title={getTitle('Not Found')}
          component={NotFoundPage}
        />
        <AppRoute
          accessLevel={AccessLevel.PUBLIC}
          path="/home/landing"
          title={getTitle('Landing')}
          component={LandingPage}
        />
        <AppRoute
          accessLevel={AccessLevel.PUBLIC}
          path="/home/map*"
          strict={false}
          sensitive={false}
          title={getTitle('Map')}
          component={MapPage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.PUBLIC}
          path="/home/access-request"
          title={getTitle('Access Request')}
          component={AccessRequestPage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.PUBLIC}
          path="/home/data-sharing-agreement"
          title={getTitle('Data Sharing Agreement')}
          component={DataSharingAgreementPage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/search/bulkedit"
          title={getTitle('Bulk Edit')}
          component={BulkEditActivitiesPage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/activity/observation"
          title={getTitle('Create Observation')}
          component={ObservationCreationStepperPage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/plan"
          title={getTitle('Plan')}
          component={PlanPage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/activities"
          title={getTitle('Activities')}
          component={ActivitiesPage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/activity"
          title={getTitle('Activity')}
          component={ActivityPage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/iapp/:id?"
          title={getTitle('IAPP Site')}
          component={ReferenceIAPPSitePage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/reports"
          title={getTitle('Reports')}
          component={EmbeddedReportsPage}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.ADMIN}
          path="/home/admin"
          title={getTitle('User Access')}
          component={UserAccessPage}
        />
        <AppRoute
          accessLevel={AccessLevel.PUBLIC}
          title="*"
          path="*"
          component={() => <Redirect to="/page-not-found" />}
        />
      </Switch>

    </ThemeProvider>
  );
};

export default AppRouter;
