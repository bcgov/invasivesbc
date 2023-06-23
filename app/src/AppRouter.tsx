import React, { useEffect } from 'react';
import { Redirect, Switch, useHistory } from 'react-router-dom';
import AccessDenied from './pages/misc/AccessDenied';
import { NotFoundPage } from './pages/misc/NotFoundPage';
import { useSelector } from './state/utilities/use_selector';
import { selectConfiguration } from './state/reducers/configuration';
import AppRoute from './router/AppRoute';

import { createTheme, CssBaseline, ThemeOptions, ThemeProvider } from '@mui/material';
import { getDesignTokens } from 'utils/CustomThemeProvider';
import { selectUserSettings } from 'state/reducers/userSettings';
import LandingPage from './features/home/landing/LandingPage';
import { TrainingPage } from "./pages/Training";
import MapPage from './features/home/map/MapPage';
import AccessRequestPage from './features/home/accessRequest/AccessRequestPage';
import BulkEditActivitiesPage from './features/home/search/BulkEditActivitiesPage';
import DataSharingAgreementPage from './features/home/dataSharingAgreement/DataSharingAgreementPage';
import ObservationCreationStepperPage from './features/home/activity/ObservationCreationStepperPage';
import PlanPage from './features/home/plan/PlanPage';
import ActivitiesPage from './features/home/activities/ActivitiesPage';
import ReferenceIAPPSitePage from './features/home/references/ReferenceIAPPSitePage';
import EmbeddedReportsPage from './features/home/reports/EmbeddedReportsPage';
import UserAccessPage from './features/admin/userAccess/UserAccessPage';
import BatchList from './features/home/batch/BatchList';
import BatchCreateNew from './features/home/batch/BatchCreateNew';
import BatchTemplates from './features/home/batch/BatchTemplates';
import BatchView from './features/home/batch/BatchView';
import ActivityPage from './features/home/activity/ActivityPage';

interface IAppRouterProps {
  deviceInfo: any;
}

export enum AccessLevel {
  PUBLIC = 'PUBLIC',
  USER = 'USER',
  ADMIN = 'ADMIN'
}

const AppRouter: React.FC<IAppRouterProps> = (props) => {
  const {DEBUG} = useSelector(selectConfiguration);
  const {location} = useHistory();
  const {darkTheme} = useSelector(selectUserSettings);

  const theme = createTheme(getDesignTokens(darkTheme) as ThemeOptions);
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
      <CssBaseline/>
      <Switch>
        <Redirect exact from="/" to="/home/landing"/>
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
          path="/home/training"
          title={getTitle('Training')}
          component={TrainingPage}
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
          accessLevel={AccessLevel.PUBLIC}
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
          exact
          accessLevel={AccessLevel.USER}
          path="/home/batch"
          title={getTitle('Batch Upload')}
          component={BatchList}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/batch/new"
          title={getTitle('Batch Upload - Create New')}
          component={BatchCreateNew}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/batch/templates"
          title={getTitle('Batch Upload - Templates')}
          component={BatchTemplates}
        />
        <AppRoute
          exact
          accessLevel={AccessLevel.USER}
          path="/home/batch/:id"
          title={getTitle('Batch Upload')}
          component={BatchView}
        />

        <AppRoute
          accessLevel={AccessLevel.PUBLIC}
          title="*"
          path="*"
          component={() => <Redirect to="/page-not-found"/>}
        />
      </Switch>

    </ThemeProvider>
  );
};

export default AppRouter;
