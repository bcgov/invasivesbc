import { ALL_ROLES } from 'constants/roles';
import ActivitiesPage from 'features/home/activities/ActivitiesPage';
import ActivityPage from 'features/home/activity/ActivityPage';
import ObservationCreationStepperPage from 'features/home/activity/ObservationCreationStepperPage';
import HomeLayout from 'features/home/HomeLayout';
import LandingPage2 from 'features/home/landing/LandingPage2';
import MapPage from 'features/home/map/MapPage';
import PlanPage from 'features/home/plan/PlanPage';
import ReferencesPage from 'features/home/references/ReferencesPage';
import BulkEditActivitiesPage from 'features/home/search/BulkEditActivitiesPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';
import PublicRoute from 'utils/PublicRoute';
import AccessRequestPage from 'features/home/accessRequest/AccessRequestPage';
import { ReferenceIAPPSitePage } from './references/ReferenceIAPPSitePage';
import { AuthStateContext } from '../../contexts/authStateContext';

interface IHomeRouterProps {
  classes: any;
}

const HomeRouter: React.FC<IHomeRouterProps> = (props) => {
  const authContext = React.useContext(AuthStateContext);
  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  return (
    <Switch>
      <Redirect exact from="/" to="/home/landing" />
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
        component={LandingPage2}
        componentProps={props}
      />
      <PublicRoute
        exact
        layout={HomeLayout}
        path="/home/access-request"
        title={getTitle('Access Request')}
        component={AccessRequestPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/search/bulkedit"
        title={getTitle('Bulk Edit')}
        roles={authContext.userRoles}
        component={BulkEditActivitiesPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activity/observation"
        title={getTitle('Create Observation')}
        roles={authContext.userRoles}
        component={ObservationCreationStepperPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/plan"
        title={getTitle('Plan')}
        roles={authContext.userRoles}
        component={PlanPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/references"
        title={getTitle('Reference')}
        roles={authContext.userRoles}
        component={ReferencesPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activities"
        title={getTitle('Activities')}
        roles={authContext.userRoles}
        component={ActivitiesPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activity"
        title={getTitle('Activity')}
        roles={authContext.userRoles}
        component={ActivityPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/iapp/:id?"
        title={getTitle('IAPP Site')}
        roles={authContext.userRoles}
        component={ReferenceIAPPSitePage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/home/*" component={() => <Redirect to="/page-not-found" />} />
      <AppRoute title="Forbidden" path="/forbidden" component={() => <Redirect to="/forbidden" />} />
    </Switch>
  );
};

export default HomeRouter;
