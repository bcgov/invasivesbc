import React from 'react';
import { Redirect, Switch } from 'react-router';
import AdminRoute from 'utils/AdminRoute';
import AppRoute from 'utils/AppRoute';
import AdminLayout from './AdminLayout';
import UserAccessPage from './userAccess/UserAccessPage';

interface IAdminRouterProps {
  classes: any;
}

const AdminRouter: React.FC<IAdminRouterProps> = (props) => {
  const getTitle = (page: string) => {
    return `InvasivesBC - ${page}`;
  };

  return (
    <Switch>
      <Redirect exact from="/admin" to="/admin/useraccess" />
      <AdminRoute
        exact
        layout={AdminLayout}
        path="/admin/useraccess"
        title={getTitle('User Access')}
        component={UserAccessPage}
        componentProps={props}
      />
      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute title="*" path="/admin/*" component={() => <Redirect to="/page-not-found" />} />
    </Switch>
  );
};

export default AdminRouter;
