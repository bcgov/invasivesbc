import buffer from '@turf/buffer';
import { getDataFromDataBC } from 'components/map/WFSConsumer';
import React, { useState, useEffect, useContext } from 'react';
import { GeoJSON, useMap, useMapEvent } from 'react-leaflet';
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
import { q } from '../MapContainer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { MapRequestContext } from 'contexts/MapRequestsContext';

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
    if (turf.booleanWithin(props.inputGeo as any, createPolygonFromBounds(map.getBounds(), map).toGeoJSON())) {
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

  const map = useMap();
  const mapRequestContext = useContext(MapRequestContext);
  const { layersSelected } = mapRequestContext;
  const [lastRequestPushed, setLastRequestPushed] = useState(null);
  //exclusively used for Async Extent
  const qRemove = (lastRequestPushed: any, newArray: any) => {
    q.remove((worker: any) => {
      if (worker.data && lastRequestPushed?.extent) {
        if (
          !turf.booleanWithin(worker.data.extent, lastRequestPushed.extent) &&
          !turf.booleanOverlap(worker.data.extent, lastRequestPushed.extent)
        ) {
          console.log('%cThe new extent does not overlap with and not inside of previous extent!', 'color:red');
          return true;
        }
        if (!newArray.includes(worker.data.layer)) {
          console.log('%cThe worker in a queue no longer needed as the layers have been changed!', 'color:red');
          return true;
        }
      }
      return false;
    });
  };

  useMapEvent('moveend', () => {
    let newArray = [];
    layersSelected.forEach((layer: any) => {
      if (layer.enabled) {
        newArray.push(layer.id);
      }
    });

    qRemove(lastRequestPushed, newArray);

    if (newArray.length > 0) {
      newArray.forEach((layer) => {
        q.push({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer }, getLayerData);

        setLastRequestPushed({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer });
      });
    }
    map.invalidateSize();
  });

  const getLayerData = async () => {
    const mapExtent = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
    const bufferedGeo = buffer(mapExtent, props.proximityInMeters / 1000);
    if (props.dataBCLayerName === 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW') {
      if (Capacitor.getPlatform() !== 'web' && !networkContext.connected) {
        const res = await query(
          {
            type: QueryType.RAW_SQL,
            sql: `SELECT * FROM layer_data WHERE layerName IN ('well');`
          },
          databaseContext
        );

        let allFeatures = [];

        res.forEach((row) => {
          if (props.inputGeo) {
            const featureArea = JSON.parse(row.featureArea).geometry;
            const featuresInArea = JSON.parse(row.featuresInArea);

            if (turf.booleanContains(props.inputGeo, featureArea) || turf.booleanOverlap(props.inputGeo, featureArea)) {
              allFeatures = allFeatures.concat(featuresInArea);
            }
          } else {
            const featureArea = JSON.parse(row.featureArea).geometry;
            const featuresInArea = JSON.parse(row.featuresInArea);

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
      if (Capacitor.getPlatform() !== 'web' && !networkContext.connected) {
        const res = await query(
          {
            type: QueryType.RAW_SQL,
            sql: `SELECT * FROM layer_data WHERE layerName NOT IN ('well');`
          },
          databaseContext
        );
        let allFeatures = [];
        res.forEach((row) => {
          const featuresInArea = JSON.parse(row.featuresInArea);
          allFeatures = allFeatures.concat(featuresInArea);
        });
        setGeosToRender(allFeatures);
      } else {
        getDataFromDataBC(props.dataBCLayerName, bufferedGeo).then((returnVal) => {
          setGeosToRender(returnVal);
          setKeyval(Math.random()); //NOSONAR
        });
      }
    }
  };

  // //when new geos received, get well data and run labeling function
  // useEffect(() => {
  //   q.push({ name: 'new extent' }, getLayerData);
  // }, [props.inputGeo]);

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
