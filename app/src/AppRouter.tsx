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
import MapPage from 'features/home/map/MapPage';
import AccessRequestPage from 'features/home/accessRequest/AccessRequestPage';
import DataSharingAgreementPage from 'features/home/dataSharingAgreement/DataSharingAgreementPage';
import BulkEditActivitiesPage from 'features/home/search/BulkEditActivitiesPage';
import ObservationCreationStepperPage from 'features/home/activity/ObservationCreationStepperPage';
import PlanPage from 'features/home/plan/PlanPage';
import ActivitiesPage from 'features/home/activities/ActivitiesPage';
import ActivityPage from 'features/home/activity/ActivityPage';
import { EmbeddedReportsPage } from 'features/home/reports/EmbeddedReportsPage';
import { ReferenceIAPPSitePage } from 'features/home/references/ReferenceIAPPSitePage';
import UserAccessPage from 'features/admin/userAccess/UserAccessPage';

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
      {/* <AppRoute path="/forbidden" title={getTitle('Forbidden')} component={AccessDenied} layout={PublicLayout} />
      <AppRoute path="/page-not-found" title={getTitle('Not Found')} component={NotFoundPage} layout={PublicLayout} />
      <AppRoute path="/home" title={getTitle('Home')} component={HomeRouter} layout={PublicLayout} /> */}
      <NewAppRoute
        accessLevel={AccessLevel.PUBLIC}
        path="/forbidden"
        title={getTitle('Forbidden')}
        component={AccessDenied}
      />
      <NewAppRoute
        accessLevel={AccessLevel.PUBLIC}
        path="/page-not-found"
        title={getTitle('Not Found')}
        component={NotFoundPage}
      />
      <NewAppRoute
        accessLevel={AccessLevel.PUBLIC}
        path="/home/landing"
        title={getTitle('Landing')}
        component={LandingPage}
      />
      <NewAppRoute
        accessLevel={AccessLevel.PUBLIC}
        path="/home/map*"
        strict={false}
        sensitive={false}
        title={getTitle('Map')}
        component={MapPage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.PUBLIC}
        path="/home/access-request"
        title={getTitle('Access Request')}
        component={AccessRequestPage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.PUBLIC}
        path="/home/data-sharing-agreement"
        title={getTitle('Data Sharing Agreement')}
        component={DataSharingAgreementPage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.USER}
        path="/home/search/bulkedit"
        title={getTitle('Bulk Edit')}
        component={BulkEditActivitiesPage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.USER}
        path="/home/activity/observation"
        title={getTitle('Create Observation')}
        component={ObservationCreationStepperPage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.USER}
        path="/home/plan"
        title={getTitle('Plan')}
        component={PlanPage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.USER}
        path="/home/activities"
        title={getTitle('Activities')}
        component={ActivitiesPage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.USER}
        path="/home/activity"
        title={getTitle('Activity')}
        component={ActivityPage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.USER}
        path="/home/iapp/:id?"
        title={getTitle('IAPP Site')}
        component={ReferenceIAPPSitePage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.ADMIN}
        path="/home/reports"
        title={getTitle('Reports')}
        component={EmbeddedReportsPage}
      />
      <NewAppRoute
        exact
        accessLevel={AccessLevel.ADMIN}
        path="/home/admin"
        title={getTitle('User Access')}
        component={UserAccessPage}
      />
      <NewAppRoute
        accessLevel={AccessLevel.PUBLIC}
        title="*"
        path="*"
        component={() => <Redirect to="/page-not-found" />}
      />
    </Switch>
  );
};

export default AppRouter;
