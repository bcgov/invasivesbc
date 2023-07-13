import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
//import { useLocation, useNavigate } from "react-router-dom";
import { useLocation} from "react-router-dom";
import "./App.css";
import Map from "./Map/Map";
import MapControls from "./Map/MapControls";
import Overlay from "./Overlay/Overlay";
import { appModeEnum } from "../state/reducers/appMode";
import { SET_APP_MODE, TOGGLE_PANEL, URL_CHANGE } from "../state/actions";
import { URLAndLayerManager } from "../URLManager";
import { Header } from "./Header/Header"; 
import { Footer } from "./Footer/Footer"; 

const App: React.FC = () => {
  const dispatch = useDispatch();

  // the 'router' behaviour is controlled by redux-saga effect handler 
  // and these useEffects
 // const navigate = useNavigate();
  const location = useLocation();
  const targetURL = useSelector((state: any) => state.appMode?.url);
  const ref = useRef(0)

  useEffect(() => {
    console.log(ref)
    if (location.pathname !== targetURL && ref.current === 0) {
      dispatch({
        type: URL_CHANGE,
        payload: { url: location.pathname},
      });
    }


    /*
    if (targetURL !== location.pathname && ref.current !== 0) {
      //navigate("/explore");
      navigate(targetURL);
    }
    */


  }, [targetURL]);


  /*
  useEffect(() => {
    if (targetURL !== location.pathname) {
      //navigate("/explore");
      navigate(targetURL);
    }
  }, [targetURL]);
  */

  // State for the overlay and app mode:
  const toggleOverlayCallback = () =>
    dispatch({ type: TOGGLE_PANEL });
  const setMode = (newMode: appModeEnum) =>
    dispatch({ type: SET_APP_MODE, payload: { mode: newMode } });

  const toggled = useSelector((state: any) => state.AppMode?.panelOpen);
  const mode = useSelector((state: any) => state.AppMode?.mode);


  useEffect(()=> {
    console.log('app mode changed')
    console.log(toggled)
  }, [toggled])

  return (
    <div className="App">
      <Header/>
      <URLAndLayerManager/>
      
      <Map className="Map">
        <MapControls
          className="MapControls"
          modeSetter={setMode}
          mode={mode}
          showOverlay={toggled}
          toggleShowOverlay={toggleOverlayCallback}
        />
      </Map>
      <Overlay mode={mode} showOverlay={toggled} >
        </Overlay>
        <Footer/>
    </div>
  );
};

export default App;
