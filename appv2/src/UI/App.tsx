import { Button, createTheme, ThemeOptions } from '@mui/material';
import { ThemeProvider } from '@mui/styles';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, useLocation } from 'react-router-dom';
import { getDesignTokens } from 'util/CustomThemeProvider';
import {
  ACTIVITY_COPY_REQUEST,
  ACTIVITY_DELETE_REQUEST,
  ACTIVITY_PASTE_REQUEST,
  ACTIVITY_SAVE_REQUEST,
  ACTIVITY_SUBMIT_REQUEST,
  OVERLAY_MENU_TOGGLE,
  URL_CHANGE
} from '../state/actions';
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
import { WhatsHereTable } from './Overlay/WhatsHere/WhatsHereTable';

// URL listener so that the auth saga can redirect to the correct page
const URL_LISTENER = (props) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const targetURL = useSelector((state: any) => state.AppMode?.url);
  useEffect(() => {
    if (location.pathname !== targetURL) {
      dispatch({
        type: URL_CHANGE,
        payload: { url: location.pathname }
      });
    }
  }, [location.pathname]);

  return null;
};

const URL_ListenerMemo = React.memo((props: any) => {
  return <URL_LISTENER />;
});

const OverlayContentMemo = React.memo((props: any) => {
  const dispatch = useDispatch();
  const overlayMenuOpen = useSelector((state: any) => state.AppMode?.overlay_menu_toggle);
  const fullScreen = useSelector((state: any) => state.AppMode?.panelFullScreen);
  const theme = createTheme(getDesignTokens(false) as ThemeOptions);
  return (
    <div className={`overlay-content ${fullScreen ? 'overlay-content-fullscreen' : ''}`}>
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
                <Button
                  onClick={() => {
                    dispatch({ type: ACTIVITY_SAVE_REQUEST });
                    dispatch({ type: OVERLAY_MENU_TOGGLE });
                  }}
                  variant="contained">
                  SAVE TO DRAFT
                </Button>
                <Button
                  onClick={() => {
                    dispatch({ type: ACTIVITY_SUBMIT_REQUEST });
                    dispatch({ type: OVERLAY_MENU_TOGGLE });
                  }}
                  variant="contained">
                  PUBLISH DRAFT TO SUBMITTED
                </Button>
                <Button
                  onClick={() => {
                    dispatch({ type: ACTIVITY_COPY_REQUEST });
                    dispatch({ type: OVERLAY_MENU_TOGGLE });
                  }}
                  variant="contained">
                  COPY FORM
                </Button>
                <Button
                  onClick={() => {
                    dispatch({ type: ACTIVITY_PASTE_REQUEST });
                    dispatch({ type: OVERLAY_MENU_TOGGLE });
                  }}
                  variant="contained">
                  PASTE FORM
                </Button>
                <Button
                  onClick={() => {
                    dispatch({ type: ACTIVITY_DELETE_REQUEST });
                    dispatch({ type: OVERLAY_MENU_TOGGLE });
                  }}
                  variant="contained">
                  DELETE
                </Button>
              </OverlayMenu>
            )}
          </>
        )}
      />

      <Route
        exact={true}
        path="/Records/List/Local:id"
        render={(props) => <RecordSet setId={props.match.params.id.split(':')[1]} />}
      />
      <Route exact={true} path="/Batch/list" render={(props) => <BatchList />} />
      <Route
        path="/Batch/list/:id"
        render={(props) => <BatchView match={props.match as any} history={undefined} location={undefined} />}
      />
      <Route path="/Batch/new" render={(props) => <BatchCreateNew />} />
      <Route path="/Batch/templates" render={(props) => <BatchTemplates />} />
      <Route path="/Reports" render={(props) => <EmbeddedReportsPage />} />
      <Route path="/Legend" render={(props) => <LegendsPopup />} />
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
      <MapCenterSetter />
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
    </div>
  );
};

export default App;
