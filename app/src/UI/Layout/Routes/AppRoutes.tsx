import { Redirect, Route } from 'react-router-dom';
import { LandingComponent } from 'UI/Features/Landing/Landing';
import { Records } from 'UI/Features/Records/Records';
import { Activity } from 'UI/Features/Records/Record';
import { IAPPRecord } from 'UI/Features/IAPP/IAPPRecord';
import { RecordSetId } from 'interfaces/UserRecordSet';
import { OfflineRecordSet } from 'UI/Features/Records/RecordSet/OfflineRecordSet';
import { RecordSet } from 'UI/Features/Records/RecordSet/RecordSet';
import React, { Suspense } from 'react';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import { WhatsHereTable } from 'UI/Features/WhatsHere/WhatsHereTable';

const UserAccessPage = React.lazy(() => import('UI/Features/Admin/userAccess/UserAccessPage'));
const EmbeddedReportsPage = React.lazy(() => import('UI/Features/Reports/EmbeddedReportsPage'));
const AccessRequestPage = React.lazy(() => import('UI/Features/AccessRequest/AccessRequestPage'));
const TrainingPage = React.lazy(() => import('UI/Features/Training/Training'));
const NewsPage = React.lazy(() => import('UI/Features/News/NewsPage'));

const BatchList = React.lazy(() => import('UI/Features/Batch/BatchList'));
const BatchView = React.lazy(() => import('UI/Features/Batch/BatchView'));
const BatchCreateNew = React.lazy(() => import('UI/Features/Batch/BatchCreateNew'));
const BatchTemplates = React.lazy(() => import('UI/Features/Batch/BatchTemplates'));

const LegendsPopup = React.lazy(() => import('UI/Features/Legend/LegendsPopup'));
const ManageTripsPage = React.lazy(() => import('UI/Features/ManageTripsPage/ManageTripsPage'));
const UserGuide = React.lazy(() => import('UI/Features/UserGuide/UserGuide'));

const BatchRoutes: React.FC = () => {
  return (
    <>
      <Route
        exact={true}
        path="/Batch/list"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <BatchList />
          </Suspense>
        )}
      />
      <Route
        path="/Batch/list/:id"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <BatchView />
          </Suspense>
        )}
      />
      <Route
        path="/Batch/new"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <BatchCreateNew />
          </Suspense>
        )}
      />
      <Route
        path="/Batch/templates"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <BatchTemplates />
          </Suspense>
        )}
      />
    </>
  );
};

const AppRoutes = () => {
  return (
    <>
      <Route exact path="/">
        <Redirect to="/Landing" />
      </Route>
      <Route path="/Map" render={() => <></>} />
      <Route path="/Landing" render={() => <LandingComponent />} />
      <Route exact={true} path="/Records" render={() => <Records />} />
      <Route path="/Records/Activity:id" render={() => <Activity />} />
      <Route path="/Records/IAPP/:id" render={() => <IAPPRecord />} />
      <Route
        exact={true}
        path="/Records/List/Local:id"
        render={(props) => (
          <>
            {props.match.params.id.split(':')[1] === RecordSetId.OfflineActivities ? (
              <OfflineRecordSet setID={props.match.params.id.split(':')[1]} />
            ) : (
              <RecordSet setID={props.match.params.id.split(':')[1]} />
            )}
          </>
        )}
      />

      <BatchRoutes />
      <Route
        path="/Reports"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <EmbeddedReportsPage />
          </Suspense>
        )}
      />

      <Route
        path="/News"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <NewsPage />
          </Suspense>
        )}
      />

      <Route
        path="/Training"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <TrainingPage />
          </Suspense>
        )}
      />

      <Route
        path="/Legend"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <LegendsPopup />
          </Suspense>
        )}
      />

      <Route
        path="/AccessRequest"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <AccessRequestPage />
          </Suspense>
        )}
      />

      <Route
        path="/Admin"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <UserAccessPage />
          </Suspense>
        )}
      />

      <Route
        path="/ManageTrips"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <ManageTripsPage />
          </Suspense>
        )}
      />
      <Route
        path="/Guide"
        render={() => (
          <Suspense fallback={<Spinner />}>
            <UserGuide />
          </Suspense>
        )}
      />
      <Route path="/WhatsHere" render={() => <WhatsHereTable />} />
    </>
  );
};

export { AppRoutes };
