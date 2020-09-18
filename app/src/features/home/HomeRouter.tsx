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
      {/* <PrivateRoute
        layout={HomeLayout}
        path="/home/cache"
        component={MapPage}
        render={(routerProps: any) => <CachePage {...routerProps} {...props} name="Map" />}
      /> */}
      {/* <PrivateRoute
        layout={HomeLayout}
        path="/home/observation/:id"
        component={MapPage}
        render={(routerProps: any) => <Observation {...routerProps} {...props} name="Observation" />}
      />
      <PrivateRoute
        layout={HomeLayout}
        path="/home/treatment/:id"
        component={MapPage}
        render={(routerProps: any) => <Treatment {...routerProps} {...props} name="Treatment" />}
      />
      <PrivateRoute
        layout={HomeLayout}
        path="/home/monitoring/:id"
        component={MapPage}
        render={(routerProps: any) => <Monitoring {...routerProps} {...props} name="Monitoring" />}
      /> */}

      {/* <PrivateRoute
        layout={HomeLayout}
        path="/home/photo"
        render={(routerProps: any) => <PhotoPage {...routerProps} {...props} name="Photos" />}
      /> */}
    </Switch>
  );
};

export default HomeRouter;
