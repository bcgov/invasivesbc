import { ALL_ROLES } from 'constants/roles';
import ActivitiesPage from 'features/home/activities/ActivitiesPage';
import ActivityPage from 'features/home/activity/ActivityPage';
import HomeLayout from 'features/home/HomeLayout';
import MapPage from 'features/home/map/MapPage';
import PlanPage from 'features/home/plan/PlanPage';
import ReferencesActivityPage from 'features/home/references/ReferencesActivityPage';
import ReferencesPage from 'features/home/references/ReferencesPage';
import BulkEditActivitiesPage from 'features/home/search/BulkEditActivitiesPage';
import TreatmentCreationStepperPage from 'features/home/activity/TreatmentCreationStepperPage';
import ObservationCreationStepperPage from 'features/home/activity/ObservationCreationStepperPage';
import SearchActivityPage from 'features/home/search/SearchActivityPage';
import LandingPage from 'features/home/landing/LandingPage';
import SearchPage from 'features/home/search/SearchPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import PrivateRoute from 'utils/PrivateRoute';

interface IHomeRouterProps {
  classes: any;
}

const HomeRouter: React.FC<IHomeRouterProps> = (props) => {
  console.log(props);
  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  return (
    <Switch>
      <Redirect exact from="/home" to="/home/landing" />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/search"
        title={getTitle('Search')}
        roles={ALL_ROLES}
        component={SearchPage}
        componentProps={props}
      />
      <PrivateRoute
        layout={HomeLayout}
        path="/home/search/activity/:id?"
        title={getTitle('Edit')}
        roles={ALL_ROLES}
        component={SearchActivityPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/search/bulkedit"
        title={getTitle('Bulk Edit')}
        roles={ALL_ROLES}
        component={BulkEditActivitiesPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activity/observation"
        title={getTitle('Create Observation')}
        roles={ALL_ROLES}
        component={ObservationCreationStepperPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activity/treatment"
        title={getTitle('Create Treatment')}
        roles={ALL_ROLES}
        component={TreatmentCreationStepperPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/plan"
        title={getTitle('Plan')}
        roles={ALL_ROLES}
        component={PlanPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/references"
        title={getTitle('Reference')}
        roles={ALL_ROLES}
        component={ReferencesPage}
        componentProps={props}
      />
      <PrivateRoute
        layout={HomeLayout}
        path="/home/references/activity/:id?"
        title={getTitle('Activity')}
        roles={ALL_ROLES}
        component={ReferencesActivityPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activities"
        title={getTitle('Activities')}
        roles={ALL_ROLES}
        component={ActivitiesPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/map"
        title={getTitle('Map')}
        roles={ALL_ROLES}
        component={MapPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activity"
        title={getTitle('Activity')}
        roles={ALL_ROLES}
        component={ActivityPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/landing"
        title={getTitle('Welcome')}
        roles={ALL_ROLES}
        component={LandingPage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/home/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default HomeRouter;
