import { Divider, makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import WellIconClosest from '../Icons/well-closest.svg';
import WellIconInside from '../Icons/well-inside.svg';
import WellIconStandard from '../Icons/well-standard.svg';
import L from 'leaflet';
import { utm_zone } from '../Tools/DisplayPosition';

const wellIconSandard = new L.Icon({
  iconUrl: WellIconStandard,
  iconRetinaUrl: WellIconStandard,
  iconAnchor: null,
  popupAnchor: [-0.5, -20],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(50, 50),
  className: 'icon'
});

const wellIconInside = new L.Icon({
  iconUrl: WellIconInside,
  iconRetinaUrl: WellIconInside,
  iconAnchor: null,
  popupAnchor: [-0.5, -20],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(50, 50),
  className: 'icon'
});

const wellIconClosest = new L.Icon({
  iconUrl: WellIconClosest,
  iconRetinaUrl: WellIconClosest,
  iconAnchor: null,
  popupAnchor: [-0.5, -20],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(50, 50),
  className: 'icon'
});

export const WellMarker = ({ feature }) => {
  return (
    <Marker
      position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
      icon={feature.inside ? wellIconInside : feature.closest ? wellIconClosest : wellIconSandard}>
      <Popup>
        <CustomWellPopup feature={feature} />
      </Popup>
    </Marker>
  );
};

const CustomWellPopup = ({ feature }) => {
  const classes = useStyles();
  let popupContent;

  //just checking if feature has properties we want
  if (feature.properties && feature.properties.popupContent) {
    popupContent = feature.properties.popupContent;
  }
  //shorten the id
  let featureId = feature.properties.GW_WW_SYSID as String;

  //Calculate utm_zone, northing and easting
  const latitude = feature.geometry.coordinates[0] || null;
  const longitude = feature.geometry.coordinates[1] || null;
  let utm = utm_zone(longitude, latitude);

  return (
    <div className={classes.popupWindow}>
      <h2>Well ID:</h2>
      <p>{featureId}</p>
      <h2>Coordinates</h2>
      <p>
        <b>Latitude: </b>
        {feature.geometry.coordinates[1]}
      </p>
      <p>
        <b>Longitude: </b>
        {feature.geometry.coordinates[0]}
      </p>
      <Divider />
      <p>
        <b>UTM Zone: </b>
        {utm[0] ? utm[0] : 'could not calculate'}
      </p>
      <p>
        <b>UTM Northing: </b>
        {utm[2] ? utm[2] : 'could not calculate'}
      </p>
      <p>
        <b>UTM Easting: </b>
        {utm[1] ? utm[1] : 'could not calculate'}
      </p>
      {popupContent}
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  popupWindow: {
    padding: '0.3rem',
    lineHeight: '100%'
  }
}));
