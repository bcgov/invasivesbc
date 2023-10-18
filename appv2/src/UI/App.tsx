import { Button, createTheme, ThemeOptions } from '@mui/material';
import { ThemeProvider } from '@mui/styles';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, useHistory, useLocation } from 'react-router-dom';
import { getDesignTokens } from 'util/CustomThemeProvider';
import { URL_CHANGE } from '../state/actions';
import './App.css';
import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import { ActivityGeo } from './Map/ActivityGeo';
import { ButtonContainer } from './Map/Buttons/ButtonContainer';
import Map from './Map/Map';
import { MapCenterSetter } from './Map/MapCenterSetter';
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
import { IAPPRecord } from "./Overlay/IAPP/IAPPRecord";
import { FormMenuButtons } from './Overlay/FormMenuButtons';
import { OnHoverActivity } from './Map/OnHoverActivity';
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from "@capacitor/browser";
import { LayerPickerBasic } from './Map/LayerPickerBasic';
import { NewRecord } from './Map/Buttons/NewRecord';
import NewRecordDialog from './Map/Buttons/NewRecordDialog';
import AccessRequestPage from './Overlay/AccessRequest/AccessRequestPage';

// URL listener so that the auth saga can redirect to the correct page
const URL_LISTENER = (props) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const targetURL = useSelector((state: any) => state.AppMode?.url);
  useEffect(() => {
    // console.log('url listenerz: ' + location.pathname);
    console.log(JSON.stringify(location, null, 2));
    if (location.pathname !== targetURL) {
      dispatch({
        type: URL_CHANGE,
        payload: { url: location.pathname }
      });
    }
  }, [location]);

  return null;
};

const URL_ListenerMemo = React.memo((props: any) => {
  return <URL_LISTENER />;
});

const AppUrlListener: React.FC<any> = () => {
  let history = useHistory();
  const dispatch = useDispatch();
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

const OverlayContentMemo = React.memo((props: any) => {
  const overlayMenuOpen = useSelector((state: any) => state.AppMode?.overlay_menu_toggle);
  const fullScreen = useSelector((state: any) => state.AppMode?.panelFullScreen);
  const theme = createTheme(getDesignTokens(false) as ThemeOptions);
  const history = useHistory();
  const {
    userRecordOnClickMenuOpen,
    userRecordOnClickRecordType,
    userRecordOnClickRecordID,
    userRecordOnClickRecordRow
  } = useSelector((state: any) => state.Map);
  return (
    <div className={`overlay-content ${fullScreen ? 'overlay-content-fullscreen' : ''}`}>
      <AppUrlListener />
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
                  Open {}
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
      <Route path="/Batch/new" render={(props) => <BatchCreateNew/>}/>
      <Route path="/Batch/templates" render={(props) => <BatchTemplates/>}/>
      <Route path="/Reports" render={(props) => <EmbeddedReportsPage/>}/>
      <Route path="/Training" render={(props) => <TrainingPage/>}/>
      <Route path="/Legend" render={(props) => <LegendsPopup/>}/>
      <Route path="/AccessRequest" render={(props) => <AccessRequestPage/>}/>
      <ThemeProvider theme={theme}>
        <Route path="/Admin" render={(props) => <UserAccessPage />} />
      </ThemeProvider>
      <Route path="/WhatsHere" render={(props) => <WhatsHereTable />} />
    </div>
  );
});

const HeaderMemo = React.memo((props: any) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%cHeaderMemo render:' + ref.current.toString(), 'color: yellow');

  return <Header />;
});

const MapMemo = React.memo((props: any) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%cMapMemo render:' + ref.current.toString(), 'color: yellow');
  return (
    <Map className="Map">
      <ButtonContainer></ButtonContainer>
      <Route path="/Records/Activity:id" render={(props) => <ActivityGeo />} />
      <Route exact={false} path="/Records" render={(props) => <OnHoverActivity />} />
      <MapCenterSetter />
      <LayerPickerBasic />
    </Map>
  );
});

const App: React.FC = () => {
    const ref = useRef(0);
    ref.current += 1;
    console.log('%cApp.tsx render:' + ref.current.toString(), 'color: yellow');

  return (
    <div id="app" className="App">
      <URL_ListenerMemo />
      <HeaderMemo />
      <MapMemo />
      <Overlay>
        <OverlayContentMemo />
      </Overlay>
      <Footer />
      <NewRecordDialog/>
    </div>
  );
};

export default App;
