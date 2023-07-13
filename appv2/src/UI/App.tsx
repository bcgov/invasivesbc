import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, useHistory, useLocation } from 'react-router-dom';
import './App.css';
import Map from './Map/Map';
import MapControls from './Map/MapControls';
import Overlay from './Overlay/Overlay';
import { appModeEnum } from '../state/reducers/appMode';
import { SET_APP_MODE, TOGGLE_PANEL, URL_CHANGE } from '../state/actions';
import { URLAndLayerManager } from '../URLManager';
import { Header } from './Header/Header';
import { Footer } from './Footer/Footer';
import { LandingComponent } from './Overlay/Landing/Landing';
import { Button, StepIcon } from '@mui/material';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const targetURL = useSelector((state: any) => state.AppMode?.url);
  const history = useHistory()
  const ref = useRef(0);
  const [mode, setMode] = useState();

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
  const modeState = useSelector((state: any) => state.AppMode);

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
      <Overlay showOverlay={true}>
        <Route path="/landing" component={LandingComponent} />
        <Route path="/other" component={StepIcon} />
      </Overlay>
      <Footer />
    </div>
  );
};

export default App;
