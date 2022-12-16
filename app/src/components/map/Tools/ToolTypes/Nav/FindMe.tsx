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
import HdIcon from '@mui/icons-material/Hd';
import SdIcon from '@mui/icons-material/Sd';
import { Divider, IconButton, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { calc_utm } from './DisplayPosition';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'state/utilities/use_selector';
import { useDispatch } from 'react-redux';
import { MAP_TOGGLE_BASEMAP, MAP_TOGGLE_HD, MAP_TOGGLE_TRACKING } from 'state/actions';

const useStyles = makeStyles((theme) => ({
  /*customHoverFocus: {
    backgroundColor: 'white',
    '&:hover, &.Mui-focusVisible': { backgroundColor: 'skyblue' }
  },*/
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

export const FindMe = (props) => {
  const dispatch = useDispatch();
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
          <span>
            <IconButton
              // disabled={startTimer}
              onClick={() => {
                try {
                  dispatch({ type: MAP_TOGGLE_TRACKING });
                  //zoomToLocation();
                } catch (e) {
                  console.log('Map SetView error', e);
                }
              }}
              className={'leaflet-control-zoom leaflet-bar leaflet-control ' + classes.customHoverFocus}
              sx={{ color: '#000' }}>
              <MyLocationIcon />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  }

  /*
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

  const removeCircle = () => {
    positionGroup.clearLayers();
    map.removeLayer(positionGroup);
    setCircleDrawn(false);
  };
  */

  /**
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
        // If accuracy is turned on, draw the accuracy circle. Otherwise, when it changes, remove it
        if (mapState?.accuracyToggle) {
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
        //map.setView(pos, map.getZoom());

            //drawCircle(foundPosition, pos.coords.accuracy);

  /**
   * LocationMarker
   * @description Component to handle the moving blue dot on the map
   * @returns {void}
   */
  function LocationMarker() {
    const mapState = useSelector(selectMap);
    if (!mapState?.userCoords?.coords?.lat) {
      return <></>;
    }
    //const UTM: any = calc_utm(mapState.userCoords., latitude);
    const couldNotCalcString = 'UTM calculation failed.';
    return (
      <Marker
        position={mapState.userCoords}
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
            {/*latitude*/}
          </p>
          <p>
            <b>Longitude: </b>
            {/*longitude*/}
          </p>
          <Divider />
          <p>
            <b>UTM Zone: </b>
            {/*UTM[0] ? UTM[0] : couldNotCalcString*/}
          </p>
          <p>
            <b>UTM Easting: </b>
            {/*UTM[1] ? UTM[1] : couldNotCalcString*/}
          </p>
          <p>
            <b>UTM Northing: </b>
            {/*UTM[2] ? UTM[2] : couldNotCalcString*/}
          </p>
          <p>
            <b>Accuracy</b>: {/*Math.round(accuracy * 10) / 10*/}m
          </p>
        </Popup>
      </Marker>
    );
  }

  return (
    <>
      <LocationMarker />
      <FindMeButton />
    </>
  );
};
