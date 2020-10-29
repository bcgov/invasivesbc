import ActivitiesPage from 'features/home/activities/ActivitiesPage';
import MapPage from 'features/home/map/MapPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import PrivateRoute from 'utils/PrivateRoute';
import ActivityPage from './activity/ActivityPage';
import HomeLayout from './HomeLayout';
import PlanPage from './plan/PlanPage';
import ReferencesPage from './references/ReferencesPage';
import ReferencesActivityPage from './references/ReferencesActivityPage';
import AppRoute from 'utils/AppRoute';

interface IHomeRouterProps {
  classes: any;
}

const HomeRouter: React.FC<IHomeRouterProps> = (props) => {
  return (
    <Switch>
      <Redirect exact from="/home" to="/home/activities" />
      <PrivateRoute exact layout={HomeLayout} path="/home/plan" component={PlanPage} componentProps={props} />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/references"
        component={ReferencesPage}
        componentProps={props}
      />
      <PrivateRoute
        layout={HomeLayout}
        path="/home/references/activity/:id?"
        component={ReferencesActivityPage}
        componentProps={props}
      />
      <PrivateRoute
        exact
        layout={HomeLayout}
        path="/home/activities"
        component={ActivitiesPage}
        componentProps={props}
      />
      <PrivateRoute exact layout={HomeLayout} path="/home/map" component={MapPage} componentProps={props} />
      <PrivateRoute exact layout={HomeLayout} path="/home/activity" component={ActivityPage} componentProps={props} />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/home/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default HomeRouter;
