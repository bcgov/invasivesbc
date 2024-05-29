import { Button } from '@mui/material';
import React, { Suspense, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, useHistory } from 'react-router-dom';
import './App.css';
import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import { Map } from './Map2/Map';
import { LandingComponent } from './Overlay/Landing/Landing';
import Overlay from './Overlay/Overlay';
import { OverlayMenu } from './Overlay/OverlayMenu';
import { Activity } from './Overlay/Records/Record';
import { Records } from './Overlay/Records/Records';
import { RecordSet } from './Overlay/Records/RecordSet';
import { WhatsHereTable } from './Overlay/WhatsHere/WhatsHereTable';
import { IAPPRecord } from './Overlay/IAPP/IAPPRecord';
import { FormMenuButtons } from './Overlay/FormMenuButtons';
import { selectGlobalErrorState } from '../state/reducers/error_handler';
import { ErrorHandler } from './ErrorHandler/ErrorHandler';
import { LayerPicker } from './Map2/LayerPicker';
import NewRecordDialog from './Overlay/Records/NewRecordDialog';
import { ButtonContainer } from './Map2/Controls/ButtonContainer';
import CustomizeLayerMenu from './Map2/Controls/CustomizeLayerDialog';
import { ConnectivityErrorHandler } from 'UI/ErrorHandler/ConnectivityErrorHandler';
import { selectAuth } from 'state/reducers/auth';
import { OfflineUserMenu } from 'UI/OfflineUserMenu/OfflineUserMenu';
import { MobileOnly } from 'UI/Predicates/MobileOnly';
import { OfflineDataSyncDialog } from 'UI/OfflineDataSync/OfflineDataSyncDialog';

import Spinner from 'UI/Spinner/Spinner';

// lazy-loaded components
const BatchList = React.lazy(() => import('./Overlay/Batch/BatchList'));
const BatchView = React.lazy(() => import('./Overlay/Batch/BatchView'));
const BatchCreateNew = React.lazy(() => import('./Overlay/Batch/BatchCreateNew'));
const BatchTemplates = React.lazy(() => import('./Overlay/Batch/BatchTemplates'));

const UserAccessPage = React.lazy(() => import('./Overlay/Admin/userAccess/UserAccessPage'));
const EmbeddedReportsPage = React.lazy(() => import('./Overlay/Reports/EmbeddedReportsPage'));
const AccessRequestPage = React.lazy(() => import('./Overlay/AccessRequest/AccessRequestPage'));
const TrainingPage = React.lazy(() => import('./Overlay/Training/Training'));
const NewsPage = React.lazy(() => import('./Overlay/News/NewsPage'));

const LegendsPopup = React.lazy(() => import('./Overlay/Legend/LegendsPopup'));

export const RENDER_DEBUG = false;

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
      ;
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

const OverlayContentMemo = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%cOverlay content render:' + ref.current.toString(), 'color: yellow');

  const overlayMenuOpen = useSelector((state: any) => state.AppMode?.overlay_menu_toggle);
  const fullScreen = useSelector((state: any) => state.AppMode?.panelFullScreen);
  const history = useHistory();

  const userRecordOnClickMenuOpen = useSelector((state: any) => state.Map.userRecordOnClickMenuOpen);
  const userRecordOnClickRecordType = useSelector((state: any) => state.Map.userRecordOnClickRecordType);
  const userRecordOnClickRecordID = useSelector((state: any) => state.Map.userRecordOnClickRecordID);
  const userRecordOnClickRecordRow = useSelector((state: any) => state.Map.userRecordOnClickRecordRow);

  return (
    <div className={`overlay-content ${fullScreen ? 'overlay-content-fullscreen' : ''}`}>
      <Route exact path="/">
        <Redirect to="/Landing" /> :
      </Route>

      <Route path="/Map" render={(props) => <></>} />
      <Route path="/Landing" render={(props) => <LandingComponent />} />
      <Route exact={true} path="/Records" render={(props) => <Records />} />
      <Route
        path="/Records/Activity:id"
        render={(props) => (
          <>
            {!overlayMenuOpen ? (
              <Activity />
            ) : (
              <OverlayMenu>
                <FormMenuButtons />
              </OverlayMenu>
            )}
          </>
        )}
      />

      <Route
        path="/Records/IAPP/:id"
        render={(props) => (
          <>
            <IAPPRecord />
          </>
        )}
      />

      <Route
        exact={true}
        path="/Records/List/Local:id"
        render={(props) => (
          <>
            {!userRecordOnClickMenuOpen ? (
              <RecordSet setID={props.match.params.id.split(':')[1]} />
            ) : (
              <OverlayMenu>
                <Button
                  onClick={() => {
                    const url =
                      userRecordOnClickRecordType === 'Activity'
                        ? '/Records/Activity:' + userRecordOnClickRecordID + '/form'
                        : '/Records/IAPP/' + userRecordOnClickRecordID + '/summary';
                    history.push(url);
                  }}
                  variant="contained"
                >
                  Open
                </Button>
              </OverlayMenu>
            )}
          </>
        )}
      />

      <BatchRoutes />

      <Route
        path="/Reports"
        render={(props) => (
          <Suspense fallback={<Spinner />}>
            <EmbeddedReportsPage />
          </Suspense>
        )}
      />
      <Route
        path="/News"
        render={(props) => (
          <Suspense fallback={<Spinner />}>
            <NewsPage />
          </Suspense>
        )}
      />
      <Route
        path="/Training"
        render={(props) => (
          <Suspense fallback={<Spinner />}>
            <TrainingPage />
          </Suspense>
        )}
      />
      <Route
        path="/Legend"
        render={(props) => (
          <Suspense fallback={<Spinner />}>
            <LegendsPopup />
          </Suspense>
        )}
      />
      <Route
        path="/AccessRequest"
        render={(props) => (
          <Suspense fallback={<Spinner />}>
            <AccessRequestPage />
          </Suspense>
        )}
      />
      <Route
        path="/Admin"
        render={(props) => (
          <Suspense fallback={<Spinner />}>
            <UserAccessPage />
          </Suspense>
        )}
      />
      <Route path="/WhatsHere" render={(props) => <WhatsHereTable />} />
    </div>
  );
};

const App: React.FC = () => {
  const authInitiated = useSelector((state: any) => state.Auth.initialized);
  const { detail: errorDetail, actions, hasCrashed } = useSelector(selectGlobalErrorState);
  const { disrupted } = useSelector(selectAuth);
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%cApp.tsx render:' + ref.current.toString(), 'color: yellow');

  if (!authInitiated) return <div id="app-pre-auth-init" />;

  if (disrupted) {
    return <ConnectivityErrorHandler />;
  }

  if (hasCrashed) {
    return <ErrorHandler detail={errorDetail} actions={actions} />;
  }

  return (
    <div id="app" className="App">
      <Header />
      <Map>
        <ButtonContainer />
        <LayerPicker />
      </Map>
      <Overlay>
        <OverlayContentMemo />
      </Overlay>
      <Footer />
      <NewRecordDialog />
      <MobileOnly>
        <OfflineDataSyncDialog />
        <OfflineUserMenu />
      </MobileOnly>
      <CustomizeLayerMenu />
    </div>
  );
};

export default App;
