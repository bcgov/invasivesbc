import * as L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
// Offline dependencies
import 'leaflet.offline';
import 'leaflet-editable';
import { Feature, GeoJsonObject } from 'geojson';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { IPointOfInterestSearchCriteria } from '../../../../../interfaces/useInvasivesApi-interfaces';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import AttributionIcon from '@mui/icons-material/Attribution';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import proj4 from 'proj4';

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

  const [group] = useState(L.layerGroup());

  const [map] = useState(useMap());

  // const map = useMap(); // Get the map from the context
  // const group = ; // Create a group to hold the drawn features
  const classes = useStyles(); // Get the classes from the context

  // Taken from DisplayPosition
  // Calculates UTM from lat/long
  const calc_utm = (longitude: number, latitude: number) => {
    let utmZone = ((Math.floor((longitude + 180) / 6) % 60) + 1).toString(); //getting utm zone
    proj4.defs([
      ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
      ['EPSG:AUTO', `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`]
    ]);
    const en_m = proj4('EPSG:4326', 'EPSG:AUTO', [longitude, latitude]); // conversion from (long/lat) to UTM (E/N)
    let utmEasting = Number(en_m[0].toFixed(0));
    let utmNorthing = Number(en_m[1].toFixed(0));
    return [utmZone, utmEasting, utmNorthing];
  };

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
    return (
      <div
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
    return (
      <div
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
    return (
      <div
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
    group.addLayer(circleProps);
    map.addLayer(group);
    setCircleDrawn(true);
  };

  /**
   * removeCircle
   * @description Removes the circle from the map by clearing the group layers
   * @returns {void}
   */
  const removeCircle = () => {
    group.clearLayers();
    map.removeLayer(group);
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
    console.log('STARTING WATCH');
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
        console.log('WATCH ID SET: ', watchId);
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
    console.log('STOPPING WATCH');
    try {
      console.log('Clearing watch ID: ' + watchId);
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
    map.setView(position, 15);
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
      findMe().then(() => {
        // Stop loading once location found
        setIsLoading(false);
      });
    }
  }, []);

  /**
   * Unmount
   * @description Clears the map and stops watching when component unmounts
   * @returns {void}
   */
  useEffect(() => {
    return () => {
      console.log('Unmounting');
      if (watchId || watching) {
        console.log('Unmounting. Unwatching');
        setWatching(false);
        Geolocation.clearWatch({ id: watchId });
      }
      setIsTracking(false);
      setAccuracyOn(false);
      setIsLoading(true);
      console.log(
        'Watch ID: ' +
          watchId +
          ' Watching: ' +
          watching +
          ' Is tracking: ' +
          isTracking +
          ' Is loading: ' +
          isLoading +
          ' Accuracy on: ' +
          accuracyOn
      );
    };
  }, []);

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
        <Popup>
          You are here: <br />
          <b>Latitude</b>: {latitude} <br />
          <b>Longitude</b>: {longitude} <br />
          <b>UTM</b>: {calc_utm(latitude, longitude)} <br />
          <b>Accuracy</b>: {Math.round(accuracy * 10) / 10}m
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
          <FindMeButton />
        ),
        [startTimer]
      )}
    </>
  );
};
export default MapLocationControlGroup;
