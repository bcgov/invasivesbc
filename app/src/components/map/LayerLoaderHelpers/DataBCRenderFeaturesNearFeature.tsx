import buffer from '@turf/buffer';
import { getDataFromDataBC } from 'components/map/WFSConsumer';
import React, { useState, useEffect, useContext } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Feature } from 'geojson';
import { Divider, makeStyles, Theme } from '@material-ui/core';
import proj4 from 'proj4';
import * as turf from '@turf/turf';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import { polygon } from '@turf/helpers';
import L from 'leaflet';

import WellIconClosest from '../Icons/well-closest.svg';
import WellIconInside from '../Icons/well-inside.svg';
import WellIconStandard from '../Icons/well-standard.svg';
import { Capacitor } from '@capacitor/core';
import { NetworkContext } from 'contexts/NetworkContext';
import { DatabaseContext2, query, QueryType } from 'contexts/DatabaseContext2';
import { DocType } from 'constants/database';
import { forEach } from 'jszip';

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

interface IRenderKeyFeaturesNearFeature {
  inputGeo: Feature;
  dataBCLayerName;
  proximityInMeters: number;
  featureType?: string;
  memoHash?: string;
  customOnEachFeature?: any;
  setWellIdandProximity?: (wellIdandProximity: any) => void;
}

export const RenderKeyFeaturesNearFeature = (props: IRenderKeyFeaturesNearFeature) => {
  const [geosWithClosest, setGeosWithClosest] = useState(null);
  const [keyval, setKeyval] = useState(0);
  const [wellIdandProximity, setWellIdandProximity] = useState(null);

  //when there is new wellId and proximity, send info to ActivityPage
  useEffect(() => {
    if (props.setWellIdandProximity) {
      props.setWellIdandProximity(wellIdandProximity);
    }
  }, [wellIdandProximity]);

  /*
   * Function for going through array and labeling 1 closest well and wells inside the polygon
   */
  const getClosestPointToPolygon = (arrayOfPoints) => {
    let index = 0;
    let nearestPointIndex = null;
    let minDistanceKm = null;
    let wellInside = false;
    arrayOfPoints.forEach((point) => {
      const turfPolygon = polygon((props.inputGeo.geometry as any).coordinates);
      const distanceKm = pointToLineDistance(point, polygonToLine(turfPolygon));
      //label points that are inside the polygon
      if (turf.inside(point, turfPolygon)) {
        arrayOfPoints[index] = { ...arrayOfPoints[index], inside: true, closest: false };
        wellInside = true;
      }
      //set index of the closest well yet
      if (!!!minDistanceKm || minDistanceKm > distanceKm) {
        minDistanceKm = distanceKm;
        if (!arrayOfPoints[index].inside) {
          nearestPointIndex = index;
        }
      }
      index++;
    });
    //label closest well
    arrayOfPoints[nearestPointIndex] = { ...arrayOfPoints[nearestPointIndex], closest: true };
    //set new data to send to ActivityPage
    if (arrayOfPoints[nearestPointIndex].properties) {
      setWellIdandProximity({
        id: arrayOfPoints[nearestPointIndex].properties.GW_WW_SYSID.toString(),
        proximity: minDistanceKm * 1000,
        wellInside: wellInside
      });
    }
    return arrayOfPoints;
  };

  const networkContext = useContext(NetworkContext);
  const databaseContext = useContext(DatabaseContext2);

  //when new geos received, get well data and run labeling function
  useEffect(() => {
    const getLayerData = async () => {
      if (props.inputGeo) {
        const bufferedGeo = buffer(props.inputGeo, props.proximityInMeters / 1000);
        if (Capacitor.getPlatform() !== 'web' && !networkContext.connected) {
          const res = await query(
            {
              type: QueryType.DOC_TYPE,
              docType: DocType.LAYER_DATA
            },
            databaseContext
          );
          let allFeatures = [];
          res.forEach((row) => {
            const featureArea = JSON.parse(row.featureArea).geometry;
            const featuresInArea = JSON.parse(row.featuresInArea);

            if (turf.booleanContains(props.inputGeo, featureArea) || turf.booleanOverlap(props.inputGeo, featureArea)) {
              allFeatures = allFeatures.concat(featuresInArea);
            }
          });
          setGeosWithClosest(getClosestPointToPolygon(allFeatures));
          setKeyval(Math.random()); //NOSONAR
        } else {
          getDataFromDataBC(props.dataBCLayerName, bufferedGeo).then((returnVal) => {
            setGeosWithClosest(getClosestPointToPolygon(returnVal));
            setKeyval(Math.random()); //NOSONAR
          }, []);
        }
      }
    };
    getLayerData();
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
                  <CustomWellPopup feature={feature} />
                </Popup>
              </Marker>
            );
          } else {
            return null;
          }
        })
      ) : (
        <></>
      )}
      )
    </>
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
