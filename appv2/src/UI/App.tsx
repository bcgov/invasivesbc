import { Button, StepIcon } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
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


const App: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const targetURL = useSelector((state: any) => state.AppMode?.url);
  const ref = useRef(0);

  // State for the overlay 

  const toggleOverlayCallback = () => {
    dispatch({ type: TOGGLE_PANEL });
    if (targetURL === "/WhatsHere") {
      dispatch({ type: MAP_TOGGLE_WHATS_HERE, payload: {toggle: false} });
    }
    if (targetURL === "/Legend") {
      dispatch({type: MAP_TOGGLE_LEGENDS});
    }
  };


  // URL listener so that the auth saga can redirect to the correct page
  useEffect(() => {
    if (location.pathname !== targetURL && ref.current === 0) {
      dispatch({
        type: URL_CHANGE,
        payload: { url: location.pathname }
      });
    }
  }, [location.pathname]);


  const toggled = useSelector((state: any) => state.AppMode?.panelOpen);

  return (
    <div className="App">
      <Header />
      <Map className="Map">
        <Route
          path="*"
          render={(props) => (
            <MapControls
              className="MapControls"
              showOverlay={toggled}
              toggleShowOverlay={toggleOverlayCallback}
            />
          )}
        />
        <ButtonContainer></ButtonContainer>
        <Route path="/Records/Activity:id" component={ActivityGeo} />
      </Map>
      <Overlay showOverlay={toggled}>
        <Route path="/Landing" component={LandingComponent} />
        <Route exact={true} path="/Records" component={Records} />
        <Route exact={true} path="/Records/List/Local:id" render={(props) => <RecordSet setId={props.match.params.id.split(':')[1]} />} />
        <Route path="/Legend" component={LegendsPopup} />
        <Route path="/WhatsHere" component={WhatsHereTable} />
      </Overlay>
      <Footer />
    </div>
  );
};

export default App;
