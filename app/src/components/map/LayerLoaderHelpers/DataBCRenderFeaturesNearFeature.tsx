import buffer from '@turf/buffer';
import { getDataFromDataBC } from 'components/map/WFSConsumer';
import React, { useState, useEffect, useContext } from 'react';
import { GeoJSON } from 'react-leaflet';
import { Feature, Geometry } from 'geojson';
import * as turf from '@turf/turf';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import { polygon } from '@turf/helpers';
import L, { Layer } from 'leaflet';
import { Capacitor } from '@capacitor/core';
import { NetworkContext } from 'contexts/NetworkContext';
import { DatabaseContext2, query, QueryType } from 'contexts/DatabaseContext2';
import { WellMarker } from './WellMarker';

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
  const [wellsWithClosest, setWellsWithClosest] = useState(null);
  const [wellIdandProximity, setWellIdandProximity] = useState(null);
  const networkContext = useContext(NetworkContext);
  const [geosToRender, setGeosToRender] = useState(null);
  const databaseContext = useContext(DatabaseContext2);
  const [keyval, setKeyval] = useState(0);

  const withAsyncQueue = async (request: any) => {
    return databaseContext.asyncQueue({
      asyncTask: () => {
        return request;
      }
    });
  };

  //when there is new wellId and proximity, send info to ActivityPage
  useEffect(() => {
    if (props.setWellIdandProximity) {
      props.setWellIdandProximity(wellIdandProximity);
    }
  }, [wellIdandProximity]);

  /*
   * Function for going through array and labeling 1 closest well and wells inside the polygon
   */
  const getClosestWellToPolygon = (arrayOfWells) => {
    let index = 0;
    let nearestWellIndex = null;
    let minDistanceKm = null;
    let wellInside = false;
    arrayOfWells.forEach((well) => {
      const turfPolygon = polygon((props.inputGeo.geometry as any).coordinates);
      const distanceKm = pointToLineDistance(well, polygonToLine(turfPolygon));
      //label points that are inside the polygon
      if (turf.inside(well, turfPolygon)) {
        arrayOfWells[index] = { ...arrayOfWells[index], inside: true, closest: false };
        wellInside = true;
      }
      //set index of the closest well yet
      if (!!!minDistanceKm || minDistanceKm > distanceKm) {
        minDistanceKm = distanceKm;
        if (!arrayOfWells[index].inside) {
          nearestWellIndex = index;
        }
      }
      index++;
    });
    //label closest well
    arrayOfWells[nearestWellIndex] = { ...arrayOfWells[nearestWellIndex], closest: true };
    //set new data to send to ActivityPage
    if (arrayOfWells[nearestWellIndex].properties) {
      setWellIdandProximity({
        id: arrayOfWells[nearestWellIndex].properties.GW_WW_SYSID.toString(),
        proximity: minDistanceKm * 1000,
        wellInside: wellInside
      });
    }
    return arrayOfWells;
  };

  const onEachFeature = props.customOnEachFeature
    ? props.customOnEachFeature
    : (feature: Feature<Geometry, any>, layer: Layer) => {
        const popupContent = `
    <div>
        <p>${feature.id}</p>                  
        <p>${JSON.stringify(feature)}</p>                  
    </div>
        `;
        layer.bindPopup(popupContent);
      };

  const getLayerData = async () => {
    if (props.inputGeo) {
      const bufferedGeo = buffer(props.inputGeo, props.proximityInMeters / 1000);
      if (props.dataBCLayerName === 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW') {
        if (Capacitor.getPlatform() !== 'web' && !networkContext.connected) {
          const res = await withAsyncQueue(
            query(
              {
                type: QueryType.RAW_SQL,
                sql: `SELECT * FROM layer_data WHERE layerName IN ('well');`
              },
              databaseContext
            )
          );
          let allFeatures = [];
          res.forEach((row) => {
            const featureArea = JSON.parse(row.featureArea).geometry;
            const featuresInArea = JSON.parse(row.featuresInArea);

            if (turf.booleanContains(props.inputGeo, featureArea) || turf.booleanOverlap(props.inputGeo, featureArea)) {
              allFeatures = allFeatures.concat(featuresInArea);
            }
          });
          setWellsWithClosest(getClosestWellToPolygon(allFeatures));
          setKeyval(Math.random()); //NOSONAR
        } else {
          getDataFromDataBC(props.dataBCLayerName, bufferedGeo).then((returnVal) => {
            setWellsWithClosest(getClosestWellToPolygon(returnVal));
            setKeyval(Math.random()); //NOSONAR
          }, []);
        }
      } else {
        if (!geosToRender) {
          if (Capacitor.getPlatform() !== 'web' && !networkContext.connected) {
            const res = await withAsyncQueue(
              query(
                {
                  type: QueryType.RAW_SQL,
                  sql: `SELECT * FROM layer_data WHERE layerName NOT IN ('well');`
                },
                databaseContext
              )
            );
            let allFeatures = [];
            res.forEach((row) => {
              const featuresInArea = JSON.parse(row.featuresInArea);
              allFeatures = allFeatures.concat(featuresInArea);
            });
            setGeosToRender(allFeatures);
          } else {
            getDataFromDataBC(props.dataBCLayerName, bufferedGeo).then((returnVal) => {
              console.log(JSON.stringify(returnVal));
              setGeosToRender(returnVal);
              setKeyval(Math.random()); //NOSONAR
            });
          }
        }
      }
    }
  };

  //when new geos received, get well data and run labeling function
  useEffect(() => {
    getLayerData();
  }, [props.inputGeo]);

  return (
    <>
      {geosToRender && keyval && <GeoJSON key={keyval} onEachFeature={onEachFeature} data={geosToRender}></GeoJSON>}
      {wellsWithClosest &&
        keyval &&
        wellsWithClosest.map((feature) => {
          if (feature.geometry.type === 'Point') {
            return <WellMarker feature={feature} />;
          } else {
            return null;
          }
        })}
      )
    </>
  );
};
