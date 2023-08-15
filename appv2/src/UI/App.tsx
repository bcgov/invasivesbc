import { Button, StepIcon } from '@mui/material';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, useHistory, useLocation } from 'react-router-dom';
import { selectMap } from 'state/reducers/map';
import { MAP_TOGGLE_LEGENDS, MAP_TOGGLE_WHATS_HERE, TOGGLE_PANEL, URL_CHANGE } from '../state/actions';
import './App.css';
import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import { ButtonContainer } from './Map/Buttons/ButtonContainer';
import Map from './Map/Map';
import MapControls from './Map/MapControls';
import { LandingComponent } from './Overlay/Landing/Landing';
import { LegendsPopup } from './Overlay/Legend/LegendsPopup';
import Overlay from './Overlay/Overlay';
import { Records } from './Overlay/Records/Records';
import { WhatsHereTable } from './Overlay/WhatsHere/WhatsHereTable';
import { ActivityGeo } from './Map/ActivityGeo';
import { RecordSet } from './Overlay/Records/RecordSet';
import EmbeddedReportsPage from './Overlay/Reports/EmbeddedReportsPage';

const URL_LISTENER = (props) => {
  const dispatch = useDispatch();
  const ref = useRef(0);

  const targetURL = useSelector((state: any) => state.AppMode?.url);
  // URL listener so that the auth saga can redirect to the correct page
  useEffect(() => {
    if (location.pathname !== targetURL && ref.current === 0) {
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
}
)


const App: React.FC = () => {
  const toggled = useSelector((state: any) => state.AppMode?.panelOpen);
  const fullScreen = useSelector((state: any) => state.AppMode?.panelFullScreen);

  const OverlayContentMemo = React.memo((props: any) => {
    return (
      <>
        <Route path="/Landing" render={(props) => <LandingComponent />} />
        <Route exact={true} path="/Records" render={(props) => <Records />} />
        <Route
          exact={true}
          path="/Records/List/Local:id"
          render={(props) => <RecordSet setId={props.match.params.id.split(':')[1]} />}
        />
        <Route path="/Batch" render={(props) => <LandingComponent />} />
        <Route path="/Reports" render={(props) => <EmbeddedReportsPage />} />
        <Route path="/Legend" render={(props) => <LegendsPopup />} />
        <Route path="/WhatsHere" render={(props) => <WhatsHereTable />} />
      </>
    );
  });

  const HeaderMemo = React.memo((props: any) => {
    return <Header />;
  })

  const MapMemo = React.memo((props: any) => {
    return <Map className="Map">
        <ButtonContainer></ButtonContainer>
        <Route path="/Records/Activity:id" render={(props) => <ActivityGeo />} />
      </Map>
  })

  return (
    <div className="App">
      <URL_ListenerMemo />
      <HeaderMemo />
      <MapMemo/>
      <Overlay showOverlay={toggled} fullScreen={fullScreen}>
        <OverlayContentMemo />
      </Overlay>
      <Footer />
    </div>
  );
};

export default App;
