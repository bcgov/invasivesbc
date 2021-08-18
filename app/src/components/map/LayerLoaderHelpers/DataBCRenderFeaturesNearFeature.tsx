import buffer from '@turf/buffer';
import { getDataFromDataBC } from 'components/map/WFSConsumer';
import React, { useState, useEffect, useMemo } from 'react';
import { GeoJSON, Marker, Popup } from 'react-leaflet';
import { Feature, Geometry } from 'geojson';
import ReactDOMServer from 'react-dom/server';
import { Layer } from 'leaflet';
import { Divider, makeStyles, Theme } from '@material-ui/core';
import proj4 from 'proj4';
import { calculateLatLng, calculateGeometryArea } from 'utils/geometryHelpers';
import * as turf from '@turf/turf';
import { AllGeoJSON, MultiLineString } from '@turf/turf';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import { polygon, point, lineString, LineString } from '@turf/helpers';
import L from 'leaflet';
import WellIconStandard from '../Icons/well-dark.svg';
import WellIconClosest from '../Icons/well-closest.svg';
import WellIconInside from '../Icons/well-inside.svg';

const wellIconSandard = new L.Icon({
  iconUrl: WellIconStandard,
  iconRetinaUrl: WellIconStandard,
  iconAnchor: null,
  popupAnchor: [-3, -20],
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
  popupAnchor: [-3, -20],
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
  popupAnchor: [-3, -20],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(50, 50),
  className: 'icon'
});

interface IRenderKeyFeaturesNearFeature {
  inputGeo: Feature;
  dataBCLayerName;
  proximityInMeters: number;
  featureType?: string;
  memoHash?: string;
  customOnEachFeature?: any;
  setWellIdandProximity?: (wellIdandProximity: any) => Object;
}

export const RenderKeyFeaturesNearFeature = (props: IRenderKeyFeaturesNearFeature) => {
  const [geosWithClosest, setGeosWithClosest] = useState(null);
  const [keyval, setKeyval] = useState(0);
  const [wellIdandProximity, setWellIdandProximity] = useState(null);

  useEffect(() => {
    props.setWellIdandProximity(wellIdandProximity);
  }, [wellIdandProximity]);

  const getClosestPointToPolygon = (arrayOfPoints) => {
    let index = 0;
    let nearestPointIndex = null;
    let minDistanceKm = null;
    let wellInside = false;
    let nearestPoint;

    arrayOfPoints.forEach((point) => {
      const turfPolygon = polygon((props.inputGeo.geometry as any).coordinates);
      const distanceKm = pointToLineDistance(point, polygonToLine(turfPolygon));
      if (!!!minDistanceKm || minDistanceKm > distanceKm) {
        minDistanceKm = distanceKm;
        // nearestPoint = nearestPointOnLine((polygonToLine(turfPolygon) as any).geometry, point);
        if (!arrayOfPoints[index].inside) nearestPointIndex = index;
      }
      if (turf.inside(point, turfPolygon)) {
        arrayOfPoints[index] = { ...arrayOfPoints[index], inside: true, closest: false };
        wellInside = true;
      }
      index++;
    });

    arrayOfPoints[nearestPointIndex] = { ...arrayOfPoints[nearestPointIndex], closest: true };

    setWellIdandProximity({
      id: arrayOfPoints[nearestPointIndex].id,
      proximity: minDistanceKm * 1000,
      wellInside: wellInside
    });
    return arrayOfPoints;
  };

  useEffect(() => {
    if (props.inputGeo) {
      const bufferedGeo = buffer(props.inputGeo, props.proximityInMeters / 1000);
      getDataFromDataBC(props.dataBCLayerName, bufferedGeo).then((returnVal) => {
        setGeosWithClosest(getClosestPointToPolygon(returnVal));
        setKeyval(Math.random()); //NOSONAR
      }, []);
    }
  }, [props.inputGeo]);

  return (
    <>
      {geosWithClosest && keyval ? (
        geosWithClosest.map((feature) => {
          if (feature.geometry.type === 'Point') {
            return (
              <Marker
                position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                icon={feature.inside ? wellIconInside : feature.closest ? wellIconClosest : wellIconSandard}>
                <Popup>
                  <CustomPopup feature={feature} />
                </Popup>
              </Marker>
            );
          }
        })
      ) : (
        <></>
      )}
      )
    </>
  );
};

const CustomPopup = ({ feature }) => {
  const classes = useStyles();

  let popupContent;
  if (feature.properties && feature.properties.popupContent) {
    popupContent = feature.properties.popupContent;
  }

  let featureId = feature.id as String;

  featureId = featureId.split('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW.fid')[1];

  const latitude = feature.geometry.coordinates[0] || null;
  const longitude = feature.geometry.coordinates[1] || null;
  let utm_easting, utm_northing, utm_zone;
  if (longitude !== undefined && latitude !== undefined) {
    utm_zone = ((Math.floor((longitude + 180) / 6) % 60) + 1).toString(); //getting utm zone
    proj4.defs([
      ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
      ['EPSG:AUTO', `+proj=utm +zone= ${utm_zone} +datum=WGS84 +units=m +no_defs`]
    ]);
    const en_m = proj4('EPSG:4326', 'EPSG:AUTO', [longitude, latitude]); // conversion from (long/lat) to UTM (E/N)
    utm_easting = Number(en_m[0].toFixed(4));
    utm_northing = Number(en_m[1].toFixed(4));
  }

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
        {utm_zone ? utm_zone : 'could not calculate'}
      </p>
      <p>
        <b>UTM Northing: </b>
        {utm_northing ? utm_northing : 'could not calculate'}
      </p>
      <p>
        <b>UTM Easting: </b>
        {utm_easting ? utm_easting : 'could not calculate'}
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
