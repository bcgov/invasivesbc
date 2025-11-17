import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router';
import { LandingComponent } from 'UI/Features/Landing/Landing';
import { Records } from 'UI/Features/Records/Records';
import { Activity } from 'UI/Features/Records/Record';
import { IAPPRecord } from 'UI/Features/IAPP/IAPPRecord';
import { RecordSetId } from 'interfaces/UserRecordSet';
import { OfflineRecordSet } from 'UI/Features/Records/RecordSet/OfflineRecordSet';
import { RecordSet } from 'UI/Features/Records/RecordSet/RecordSet';
import React, { Suspense, useEffect } from 'react';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import { WhatsHereTable } from 'UI/Features/WhatsHere/WhatsHereTable';
import { useSelector } from 'utils/use_selector';
import AdminLayout from 'UI/Features/Admin/AdminLayout';
import BatchLayout from 'UI/Features/Batch/BatchLayout';

const EmailSettings = React.lazy(() => import('UI/Features/Admin/email-setup/EmailSettings'));
const EmailTemplates = React.lazy(() => import('UI/Features/Admin/email-setup/EmailTemplates'));
const PendingRequests = React.lazy(() => import('UI/Features/Admin/requests/PendingRequests'));
const RoleAssignment = React.lazy(() => import('UI/Features/Admin/users/RoleAssignment'));

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

const AppRoutes = () => {
  const navigate = useNavigate();
  const userActivated = useSelector((state) => state.UserInfo.activated);
  const userLoaded = useSelector((state) => state.UserInfo.loaded);

  useEffect(() => {
    if (!userActivated && userLoaded) {
      navigate('/AccessRequest');
    }
  }, [userActivated, userLoaded]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Landing" replace />} />
      <Route path="/Map" Component={() => <></>} />
      <Route path="/Landing" Component={() => <LandingComponent />} />
      <Route path="/Records/Activity/:id/:mode" Component={() => <Activity />}></Route>

      <Route path="/Records/IAPP/:id/:mode" Component={() => <IAPPRecord />} />
      <Route
        path="/Records/List/Local/:id"
        Component={() => {
          const { id } = useParams<{ id: string }>();
          if (id) {
            return (
              <>{id === RecordSetId.OfflineActivities ? <OfflineRecordSet setID={id} /> : <RecordSet setID={id} />}</>
            );
          }
          return null;
        }}
      />

      <Route path="/Records" Component={() => <Records />} />

      <Route
        path="/Reports"
        Component={() => (
          <Suspense fallback={<Spinner />}>
            <EmbeddedReportsPage />
          </Suspense>
        )}
      />

      <Route
        path="/News"
        Component={() => (
          <Suspense fallback={<Spinner />}>
            <NewsPage />
          </Suspense>
        )}
      />

      <Route
        path="/Training"
        Component={() => (
          <Suspense fallback={<Spinner />}>
            <TrainingPage />
          </Suspense>
        )}
      />

      <Route
        path="/Legend"
        Component={() => (
          <Suspense fallback={<Spinner />}>
            <LegendsPopup />
          </Suspense>
        )}
      />

      <Route
        path="/AccessRequest"
        Component={() => (
          <Suspense fallback={<Spinner />}>
            <AccessRequestPage />
          </Suspense>
        )}
      />

      <Route
        path="/Admin/emailSettings"
        Component={() => (
          <AdminLayout>
            <Suspense fallback={<Spinner />}>
              <EmailSettings />
            </Suspense>
          </AdminLayout>
        )}
      />
      <Route
        path="/Admin/emailTemplates"
        Component={() => (
          <AdminLayout>
            <Suspense fallback={<Spinner />}>
              <EmailTemplates />
            </Suspense>
          </AdminLayout>
        )}
      />
      <Route
        path="/Admin/accessRequests"
        Component={() => (
          <AdminLayout>
            <Suspense fallback={<Spinner />}>
              <PendingRequests />
            </Suspense>
          </AdminLayout>
        )}
      />

      <Route
        path="/Admin/roleAssignment"
        Component={() => (
          <AdminLayout>
            <Suspense fallback={<Spinner />}>
              <RoleAssignment />
            </Suspense>
          </AdminLayout>
        )}
      />

      <Route
        path="/ManageTrips"
        Component={() => (
          <Suspense fallback={<Spinner />}>
            <ManageTripsPage />
          </Suspense>
        )}
      />
      <Route
        path="/Guide"
        Component={() => (
          <Suspense fallback={<Spinner />}>
            <UserGuide />
          </Suspense>
        )}
      />
      <Route path="/WhatsHere" Component={() => <WhatsHereTable />} />
      <Route
        path="/Batch/list"
        Component={() => (
          <BatchLayout>
            <Suspense fallback={<Spinner />}>
              <BatchList />
            </Suspense>
          </BatchLayout>
        )}
      />
      <Route
        path="/Batch/list/:id"
        Component={() => (
          <BatchLayout>
            <Suspense fallback={<Spinner />}>
              <BatchView />
            </Suspense>
          </BatchLayout>
        )}
      />
      <Route
        path="/Batch/new"
        Component={() => (
          <BatchLayout>
            <Suspense fallback={<Spinner />}>
              <BatchCreateNew />
            </Suspense>
          </BatchLayout>
        )}
      />
      <Route
        path="/Batch/templates"
        Component={() => (
          <BatchLayout>
            <Suspense fallback={<Spinner />}>
              <BatchTemplates />
            </Suspense>
          </BatchLayout>
        )}
      />
    </Routes>
  );
};

export { AppRoutes };
