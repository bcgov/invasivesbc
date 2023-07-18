import { Button, StepIcon } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, useHistory, useLocation } from 'react-router-dom';
import { TOGGLE_PANEL, URL_CHANGE } from '../state/actions';
import './App.css';
import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import Map from './Map/Map';
import MapControls from './Map/MapControls';
import { LandingComponent } from './Overlay/Landing/Landing';
import Overlay from './Overlay/Overlay';
import { Records } from './Overlay/Records/Records';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const targetURL = useSelector((state: any) => state.AppMode?.url);
  const ref = useRef(0);

  // State for the overlay 
  const toggleOverlayCallback = () => dispatch({ type: TOGGLE_PANEL });


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
        <Route
          path="/other"
          render={(props) => (
            <Button
              onClick={() => {
                console.log('banana');
              }}    
            />
          )}    
        />
      </Map>
      <Overlay showOverlay={toggled}>
        <Route path="/Landing" component={LandingComponent} />
        <Route path="/Records" component={Records} />
      </Overlay>
      <Footer />
    </div>
  );
};

export default App;
