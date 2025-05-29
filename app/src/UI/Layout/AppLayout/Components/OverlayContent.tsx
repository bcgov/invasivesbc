import React, { Suspense, useRef } from 'react';
import { useSelector } from 'utils/use_selector';
import { Redirect, Route } from 'react-router-dom';
import { LandingComponent } from 'UI/Features/Landing/Landing';
import { Records } from 'UI/Features/Records/Records';
import { Activity } from 'UI/Features/Records/Record';
import { IAPPRecord } from 'UI/Features/IAPP/IAPPRecord';
import { RecordSet } from 'UI/Features/Records/RecordSet/RecordSet';
import { RecordSetId } from 'interfaces/UserRecordSet';
import Spinner from 'UI/Reusable/Spinner/Spinner';
import { WhatsHereTable } from 'UI/Features/WhatsHere/WhatsHereTable';
import { RENDER_DEBUG } from 'UI/App';
import { OverlayHeader } from 'UI/Layout/OverlayLayout/OverlayHeader';
import { OfflineRecordSet } from 'UI/Features/Records/RecordSet/OfflineRecordSet';

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

const TileCachePanel = React.lazy(() => import('UI/Features/TileCache/TileCachePanel'));

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

const OverlayContent = () => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) {
    console.log('%cOverlay content render:' + ref.current.toString(), 'color: yellow');
  }
  const fullScreen = useSelector((state) => state.AppMode.panelFullScreen);

  return (
    <>
      {!fullScreen && <OverlayHeader />}
      <div className={`overlay-content ${fullScreen ? 'overlay-content-fullscreen' : ''}`}>
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
          path="/OfflineTiles"
          render={() => (
            <Suspense fallback={<Spinner />}>
              <TileCachePanel />
            </Suspense>
          )}
        />
        <Route path="/WhatsHere" render={() => <WhatsHereTable />} />
      </div>
    </>
  );
};

export { OverlayContent };
