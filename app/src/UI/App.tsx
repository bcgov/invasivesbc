import { Button, createTheme, ThemeOptions } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Route, useHistory, Redirect } from 'react-router-dom';
import { getDesignTokens } from 'utils/CustomThemeProvider';
import './App.css';
import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import { Map } from './Map2/Map';
import UserAccessPage from './Overlay/Admin/userAccess/UserAccessPage';
import BatchCreateNew from './Overlay/Batch/BatchCreateNew';
import BatchList from './Overlay/Batch/BatchList';
import BatchTemplates from './Overlay/Batch/BatchTemplates';
import BatchView from './Overlay/Batch/BatchView';
import { LandingComponent } from './Overlay/Landing/Landing';
import { LegendsPopup } from './Overlay/Legend/LegendsPopup';
import Overlay from './Overlay/Overlay';
import { OverlayMenu } from './Overlay/OverlayMenu';
import { Activity } from './Overlay/Records/Record';
import { Records } from './Overlay/Records/Records';
import { RecordSet } from './Overlay/Records/RecordSet';
import EmbeddedReportsPage from './Overlay/Reports/EmbeddedReportsPage';
import { TrainingPage } from './Overlay/Training/Training';
import { WhatsHereTable } from './Overlay/WhatsHere/WhatsHereTable';
import { IAPPRecord } from './Overlay/IAPP/IAPPRecord';
import { FormMenuButtons } from './Overlay/FormMenuButtons';
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import AccessRequestPage from './Overlay/AccessRequest/AccessRequestPage';
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
import { NewsPage } from './Overlay/News/NewsPage';

export const RENDER_DEBUG = false;

const AppUrlListener: React.FC<any> = () => {
  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      if (event.url.indexOf('code') !== -1) {
        Browser.close();
        document.location.href = `${document.location.href}?${event.url.split('?').pop()}`;
      }
    });
  }, []);

  return null;
};

const OverlayContentMemo = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%cOverlay content render:' + ref.current.toString(), 'color: yellow');

  const overlayMenuOpen = useSelector((state: any) => state.AppMode?.overlay_menu_toggle);
  const fullScreen = useSelector((state: any) => state.AppMode?.panelFullScreen);
  const theme = createTheme(getDesignTokens(false) as ThemeOptions);
  const history = useHistory();

  const userRecordOnClickMenuOpen = useSelector((state: any) => state.Map.userRecordOnClickMenuOpen);
  const userRecordOnClickRecordType = useSelector((state: any) => state.Map.userRecordOnClickRecordType);
  const userRecordOnClickRecordID = useSelector((state: any) => state.Map.userRecordOnClickRecordID);
  const userRecordOnClickRecordRow = useSelector((state: any) => state.Map.userRecordOnClickRecordRow);

  return (
    <div className={`overlay-content ${fullScreen ? 'overlay-content-fullscreen' : ''}`}>
      <AppUrlListener />
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
                  variant="contained">
                  Open
                </Button>
              </OverlayMenu>
            )}
          </>
        )}
      />
      <Route exact={true} path="/Batch/list" render={(props) => <BatchList />} />
      <Route
        path="/Batch/list/:id"
        render={(props) => <BatchView match={props.match as any} history={undefined} location={undefined} />}
      />
      <Route path="/Batch/new" render={(props) => <BatchCreateNew />} />
      <Route path="/Batch/templates" render={(props) => <BatchTemplates />} />
      <Route path="/Reports" render={(props) => <EmbeddedReportsPage />} />
      <Route path="/News" render={(props) => <NewsPage />} />
      <Route path="/Training" render={(props) => <TrainingPage />} />
      <Route path="/Legend" render={(props) => <LegendsPopup />} />
      <Route path="/AccessRequest" render={(props) => <AccessRequestPage />} />
      <Route path="/Admin" render={(props) => <UserAccessPage />} />
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
