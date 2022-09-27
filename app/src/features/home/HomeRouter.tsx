import ActivitiesPage from 'features/home/activities/ActivitiesPage';
import ActivityPage from 'features/home/activity/ActivityPage';
import ObservationCreationStepperPage from 'features/home/activity/ObservationCreationStepperPage';
import HomeLayout from 'features/home/HomeLayout';
import MapPage from 'features/home/map/MapPage';
import PlanPage from 'features/home/plan/PlanPage';
import BulkEditActivitiesPage from 'features/home/search/BulkEditActivitiesPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import PublicRoute from 'utils/PublicRoute';
import AccessRequestPage from 'features/home/accessRequest/AccessRequestPage';
import { ReferenceIAPPSitePage } from './references/ReferenceIAPPSitePage';
import LandingPage from './landing/LandingPage';
import { EmbeddedReportsPage } from './reports/EmbeddedReportsPage';
import DataSharingAgreementPage from 'features/home/dataSharingAgreement/DataSharingAgreementPage';
import UserAccessPage from 'features/admin/userAccess/UserAccessPage';

interface IHomeRouterProps {
  classes: any;
}

const HomeRouter: React.FC<IHomeRouterProps> = (props) => {
  // PROPS: CLASSES FROM PUBLICLAYOUT
  console.log('GOT PROPS FOR HOMEROUTER: ', props);
  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  return (
    <Switch>
      <PublicRoute
        layout={HomeLayout}
        path="/home/map*"
        strict={false}
        sensitive={false}
        title={getTitle('Map')}
        component={MapPage}
      />
      <PublicRoute
        exact
        layout={HomeLayout}
        path="/home/landing"
        title={getTitle('Welcome')}
        component={LandingPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/access-request"
        title={getTitle('Access Request')}
        component={AccessRequestPage}
        componentProps={props}
      />
      <PublicRoute
        exact
        layout={HomeLayout}
        path="/home/data-sharing-agreement"
        title={getTitle('Data Sharing Agreement')}
        component={DataSharingAgreementPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/search/bulkedit"
        title={getTitle('Bulk Edit')}
        component={BulkEditActivitiesPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activity/observation"
        title={getTitle('Create Observation')}
        component={ObservationCreationStepperPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/plan"
        title={getTitle('Plan')}
        component={PlanPage}
        componentProps={props}
      />

      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activities"
        title={getTitle('Activities')}
        component={ActivitiesPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activity"
        title={getTitle('Activity')}
        component={ActivityPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/reports"
        title={getTitle('Reports')}
        component={EmbeddedReportsPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/iapp/:id?"
        title={getTitle('IAPP Site')}
        component={ReferenceIAPPSitePage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/admin"
        title={getTitle('User Access')}
        component={UserAccessPage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/home/*" component={() => <Redirect to="/page-not-found" />} />
      <AppRoute title="Forbidden" path="/forbidden" component={() => <Redirect to="/forbidden" />} />
    </Switch>
  );
};

export default HomeRouter;
