import ActivitiesPage from 'features/home/activities/ActivitiesPage';
import MapPage from 'features/home/map/MapPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import PrivateRoute from 'utils/PrivateRoute';
import ActivityPage from './activity/ActivityPage';
import HomeLayout from './HomeLayout';
import PlanPage from './plan/PlanPage';

interface IHomeRouterProps {
  classes: any;
}

const HomeRouter: React.FC<IHomeRouterProps> = (props) => {
  return (
    <Switch>
      <Redirect exact from="/home" to="/home/activities" />
      <PrivateRoute layout={HomeLayout} path="/home/plan" component={PlanPage} componentProps={props} />
      <PrivateRoute layout={HomeLayout} path="/home/activities" component={ActivitiesPage} componentProps={props} />
      <PrivateRoute layout={HomeLayout} path="/home/map" component={MapPage} componentProps={props} />
      <PrivateRoute layout={HomeLayout} path="/home/activity" component={ActivityPage} componentProps={props} />
    </Switch>
  );
};

export default HomeRouter;
