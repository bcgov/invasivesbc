import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import 'leaflet.offline';
import 'leaflet-editable';
import { Feature, GeoJsonObject } from 'geojson';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { IPointOfInterestSearchCriteria } from '../../../../../interfaces/useInvasivesApi-interfaces';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import AttributionIcon from '@mui/icons-material/Attribution';
import { Divider, IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { calc_utm } from '../../../Tools/ToolTypes/Nav/DisplayPosition';

const useStyles = makeStyles((theme) => ({
  customHoverFocus: {
    backgroundColor: 'white',
    '&:hover, &.Mui-focusVisible': { backgroundColor: 'skyblue' }
  },
  selected: {
    backgroundColor: '#2196f3',
    color: 'white'
  },
  notSelected: {
    backgroundColor: 'white',
    color: 'black'
  }
}));

const baseUrl = window.location.href.split('/home')[0]; // Base URL of application for hosted image

export interface IMapLocationControlGroupProps {
  classes?: any;
  mapId: string;
  showDrawControls: boolean;
  zoom?: any;
  center?: any;
  isPlanPage?: boolean;
  activityId?: string;
  activity?: any;
  cacheMapTilesFlag?: any;
  pointOfInterestFilter?: IPointOfInterestSearchCriteria;
  geometryState: { geometry: any[]; setGeometry: (geometry: Feature[]) => void };
  interactiveGeometryState?: {
    interactiveGeometry: any;
    setInteractiveGeometry: (interactiveGeometry: GeoJsonObject) => void;
  };
  setMapForActivityPage?: React.Dispatch<any>;
  contextMenuState?: { state: any; setContextMenuState: (state: any) => void };
}

const MapLocationControlGroup: React.FC<IMapLocationControlGroupProps> = (props) => {
  const [isLoading, setIsLoading] = useState(true); // Keeps track of whether or not the map is loading

  const [isTracking, setIsTracking] = useState(false); // Toggle for track me button
  const [accuracyOn, setAccuracyOn] = useState(false); // Toggle for find me button

  const [position, setPosition] = useState(null); // State variable for current position
  const [accuracy, setAccuracy] = useState(0); // State variable for position's accuracy
  const [latitude, setLatitude] = useState(0); // State variable for position's latitude
  const [longitude, setLongitude] = useState(0); // State variable for position's longitude

  const [watching, setWatching] = useState(false); // Keeps track of whether or not we're watching current position
  const [watchId, setWatchId] = useState(null); // Keeps track of the watch id

  const [circleDrawn, setCircleDrawn] = useState(false); // Keeps track of whether or not a circle has been drawn

  const [initialTime, setInitialTime] = useState(0); // Keeps track of the initial time of the timer
  const [startTimer, setStartTimer] = useState(false); // Keeps track of whether or not the timer has started

  const [showTopo, setShowTopo] = useState(false);

  const [positionGroup] = useState(L.layerGroup());
  const [baseMapGroup] = useState(L.layerGroup());

  const [map] = useState(useMap());

  const topoMap = (L.tileLayer as any).offline(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '&copy; <a href="http://www.esri.com/copyright">ESRI</a>',
      subdomains: 'abc',
      zIndex: 3000,
      crossOrigin: true
    }
  );
  // const map = useMap(); // Get the map from the context
  // const group = ; // Create a group to hold the drawn features
  const classes = useStyles(); // Get the classes from the context

  // Taken from DisplayPosition
  // Timer to wait x seconds before allowing user to interact with controls
  // Provides some buffer time for map to load on slower devices
  const timer = ({ initialTime, setInitialTime }, { startTimer, setStartTimer }) => {
    if (initialTime > 0) {
      setTimeout(() => {
        setInitialTime(initialTime - 1);
      }, 1000);
    }
    if (initialTime === 0 && startTimer) {
      setStartTimer(false);
    }
  };

  // Taken from DisplayPosition
  // Checks if timer has been started, and if so, starts countdown
  useEffect(() => {
    timer({ initialTime, setInitialTime }, { startTimer, setStartTimer });
  }, [initialTime, startTimer]);

  /**
   * TrackMeButton
   * @description Component to handle the functionality of the find me button
   * @returns {void}
   */
  function FindMeButton() {
    const classes = useStyles();
    const divRef = useRef();
    useEffect(() => {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    }, []);
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '30px',
          width: '40px',
          height: '40px'
        }}>
        <Tooltip title="Find Me" placement="right-start">
          <IconButton
            disabled={startTimer}
            onClick={() => {
              try {
                zoomToLocation();
              } catch (e) {
                console.log('Map SetView error', e);
              }
            }}
            className={'leaflet-control-zoom leaflet-bar leaflet-control ' + classes.customHoverFocus}
            sx={{ color: '#000' }}>
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  /**
   * TrackMeButton
   * @description Component to handle the functionality of the track me button
   * @returns {void}
   */
  function TrackMeButton() {
    const divRef = useRef();
    useEffect(() => {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    }, []);
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '80px',
          width: '40px',
          height: '40px'
        }}>
        <Tooltip title={isTracking ? 'Stop Tracking' : 'Track Me'} placement="right-start">
          <IconButton
            disabled={startTimer}
            onClick={() => {
              setIsTracking(!isTracking);
            }}
            className={
              'leaflet-control-zoom leaflet-bar leaflet-control ' +
              classes.customHoverFocus +
              ' ' +
              (isTracking ? classes.selected : classes.notSelected)
            }
            sx={{ color: '#000' }}>
            <FollowTheSignsIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  /**
   * AccuracyButton
   * @description Component to handle the functionality of the accuracy circle
   * @returns {void}
   */
  function AccuracyButton() {
    const divRef = useRef();
    useEffect(() => {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    }, []);
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '130px',
          width: '40px',
          height: '40px'
        }}>
        <Tooltip title={accuracyOn ? 'Hide Accuracy' : 'Show Accuracy'} placement="right-start">
          <IconButton
            disabled={startTimer}
            onClick={() => {
              setAccuracyOn(!accuracyOn);
            }}
            className={
              'leaflet-control-zoom leaflet-bar leaflet-control ' +
              classes.customHoverFocus +
              ' ' +
              (accuracyOn ? classes.selected : classes.notSelected)
            }
            sx={{ color: '#000' }}>
            <AttributionIcon />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  /**
   * BaseMapToggleButton
   * @description Component to handle the functionality of the base map toggle
   * @returns {void}
   */
  function BaseMapToggleButton() {
    const divRef = useRef();
    useEffect(() => {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
    }, []);
    return (
      <div
        ref={divRef}
        className="leaflet-bottom leaflet-right"
        style={{
          bottom: '180px',
          width: '40px',
          height: '40px'
        }}>
        <Tooltip title={showTopo ? 'Imagery Map' : 'Topographical Map'} placement="right-start">
          <IconButton
            disabled={startTimer}
            onClick={() => {
              setShowTopo(!showTopo);
            }}
            className={
              'leaflet-control-zoom leaflet-bar leaflet-control ' +
              classes.customHoverFocus +
              ' ' +
              (showTopo ? classes.selected : classes.notSelected)
            }
            sx={{ color: '#000' }}>
            {showTopo ? <LayersClearIcon /> : <LayersIcon />}
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  /**
   * drawCircle
   * @description Draws a circle at a position with a given radius
   * @returns {void}
   */
  const drawCircle = (pos, radius) => {
    // Remove the circle first, if it exists
    if (circleDrawn) {
      removeCircle();
    }
    // Create the new circle
    const circleProps = L.circle(pos, {
      color: '#00FF00',
      fillColor: '#00FF00',
      fillOpacity: 0.2,
      radius
    });
    // Remove the circle
    // Draw the new circle
    positionGroup.addLayer(circleProps);
    map.addLayer(positionGroup);
    setCircleDrawn(true);
  };

  /**
   * removeCircle
   * @description Removes the circle from the map by clearing the group layers
   * @returns {void}
   */
  const removeCircle = () => {
    positionGroup.clearLayers();
    map.removeLayer(positionGroup);
    setCircleDrawn(false);
  };

  /**
   * foundLocation
   * @description Callback function from wacth() that displays the user's location
   * @returns {void}
   */
  const foundLocation = (position) => {
    try {
      if (!map || !position) {
        // If we have no map or no position, we can't do anything
        // Exit gracefully
        console.log('No map or position provided, exiting...');
        return;
      } else {
        const pos = L.latLng(position.coords.latitude, position.coords.longitude);
        const radius = position.coords.accuracy;
        // Set state variables
        setPosition(pos);
        setAccuracy(radius);
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);

        // Go to new position
        map.setView(pos, map.getZoom());
        // If accuracy is turned on, draw the accuracy circle. Otherwise, when it changes, remove it
        if (accuracyOn) {
          drawCircle(pos, radius);
        } else {
          if (circleDrawn) {
            removeCircle();
          }
        }
      }
    } catch (e) {
      console.error('Error: ', e);
    }
  };

  /**
   * watch
   * @description Tries to start a watch for the user's current location
   * @description Should only be called when tracking toggle is ON and the map is loaded
   * @returns {void}
   */
  const watch = async () => {
    if (watchId || watching) {
      console.log('Watch already exists. Will not start new one.');
    } else {
      try {
        setWatching(true);
        const options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        };
        const watchId = await Geolocation.watchPosition(options, foundLocation);
        setWatchId(watchId);
      } catch (e) {
        console.error('Error starting watch: ', e);
      }
    }
  };

  /**
   * stopWatch
   * @description Tries to stop watching the user's current location
   * @description Should only be called when tracking toggle is OFF and the map is loaded
   * @returns {void}
   */
  const stopWatch = async (watchId) => {
    try {
      await Geolocation.clearWatch({ id: watchId });
      setWatching(false);
      setWatchId(null);
    } catch (e) {
      console.log('Error stopping watch: ', e);
    }
  };

  const zoomToLocation = async () => {
    if (!position) {
      await findMe();
    }
    if (position) {
      map.setView(position, 15);
    }
  };

  /**
   * findMe
   * @description Tries to get a user's current position, called on initial load
   * @returns {void}
   */
  const findMe = async () => {
    try {
      // Find current position and set latitude, longitude, position and accuracy
      await Geolocation.getCurrentPosition()
        .then((pos) => {
          setPosition(L.latLng(pos.coords.latitude, pos.coords.longitude));
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAccuracy(pos.coords.accuracy);
          const foundPosition = L.latLng(pos.coords.latitude, pos.coords.longitude);
          if (accuracyOn) {
            drawCircle(foundPosition, pos.coords.accuracy);
          }
          map.setView(foundPosition, map.getZoom());
        })
        .catch((error) => {
          console.log('Error getting position: ', error);
        });
    } catch (e) {
      console.error('Error occurred trying to get current position: ', e);
    }
  };

  /**
   * Mount
   * @description Starts timer when the map is ready and attempts to find initial position
   * @returns {void}
   */
  useEffect(() => {
    // If initial load (if isLoading is true), find user's current position and start timer before interacting with controls
    if (isLoading) {
      setInitialTime(2);
      setStartTimer(true);

      // findMe().then(() => {
      //   // Stop loading once location found
      //   setIsLoading(false);
      // });

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, []);

  /**
   * Unmount
   * @description Clears the map and stops watching when component unmounts
   * @returns {void}
   */
  useEffect(() => {
    return () => {
      if (watchId || watching) {
        setWatching(false);
        Geolocation.clearWatch({ id: watchId });
      }
      setIsTracking(false);
      setAccuracyOn(false);
      setShowTopo(false);
      setIsLoading(true);
    };
  }, []);

  useEffect(() => {
    // If showTopo changes, disable or enable the circle
    if (showTopo) {
      baseMapGroup.addLayer(topoMap);
      map.addLayer(baseMapGroup);
    } else {
      baseMapGroup.clearLayers();
      map.removeLayer(baseMapGroup);
    }
  }, [showTopo]);

  // If accuracy toggle changed, either hide or show accuracy circle
  useEffect(() => {
    // If accuracyOn changes, disable or enable the circle
    if (accuracyOn && !!position && !!accuracy) {
      drawCircle(position, accuracy);
    } else {
      removeCircle();
    }
  }, [accuracyOn, position, accuracy, drawCircle, removeCircle]);

  // If tracking toggle is changed, handle appropriately
  useEffect(() => {
    if (isTracking) {
      // Tracking enabled, start watch and create circle if accuracyOn
      watch();
    } else {
      // Tracking disabled, remove the circle and stop watching
      stopWatch(watchId);
    }
  }, [isTracking]);

  /**
   * LocationMarker
   * @description Component to handle the moving blue dot on the map
   * @returns {void}
   */
  function LocationMarker() {
    const UTM: any = calc_utm(longitude, latitude);
    const couldNotCalcString = 'UTM calculation failed.';
    return position === null ? null : (
      <Marker
        position={position}
        icon={
          // DefaultIcon
          L.icon({
            iconUrl: baseUrl + '/assets/icon/circle.png',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -20]
          })
        }>
        <Popup closeButton={false}>
          <h2>You are here:</h2>
          <p>
            <b>Latitude: </b>
            {latitude}
          </p>
          <p>
            <b>Longitude: </b>
            {longitude}
          </p>
          <Divider />
          <p>
            <b>UTM Zone: </b>
            {UTM[0] ? UTM[0] : couldNotCalcString}
          </p>
          <p>
            <b>UTM Easting: </b>
            {UTM[1] ? UTM[1] : couldNotCalcString}
          </p>
          <p>
            <b>UTM Northing: </b>
            {UTM[2] ? UTM[2] : couldNotCalcString}
          </p>
          <p>
            <b>Accuracy</b>: {Math.round(accuracy * 10) / 10}m
          </p>
        </Popup>
      </Marker>
    );
  }

  return (
    <>
      {useMemo(
        () => (
          <AccuracyButton />
        ),
        [accuracyOn, startTimer]
      )}
      {useMemo(
        () => (
          <TrackMeButton />
        ),
        [isTracking, startTimer]
      )}
      {useMemo(
        () => (
          <>
            <LocationMarker />
          </>
        ),
        [position, accuracyOn, isTracking, startTimer]
      )}
      {useMemo(
        () => (
          <BaseMapToggleButton />
        ),
        [showTopo, startTimer]
      )}
      {useMemo(
        () => (
          <FindMeButton />
        ),
        [startTimer]
      )}
    </>
  );
};
export default MapLocationControlGroup;
