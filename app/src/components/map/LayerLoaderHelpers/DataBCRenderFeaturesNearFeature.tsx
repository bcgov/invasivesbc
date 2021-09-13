import React, { useState, useEffect, useContext } from 'react';
import { GeoJSON, useMap, useMapEvent } from 'react-leaflet';
import { Feature, Geometry } from 'geojson';
import * as turf from '@turf/turf';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import { polygon } from '@turf/helpers';
import { Layer } from 'leaflet';
import { DatabaseContext2, query, QueryType } from '../../../contexts/DatabaseContext2';
import { WellMarker } from './WellMarker';
import { q } from '../MapContainer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { MapRequestContext } from '../../../contexts/MapRequestsContext';

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
  const [geosToRender, setGeosToRender] = useState(null);
  const databaseContext = useContext(DatabaseContext2);
  const [keyval, setKeyval] = useState(0);

  //when there is new wellId and proximity, send info to ActivityPage
  useEffect(() => {
    if (props.setWellIdandProximity) {
      props.setWellIdandProximity(wellIdandProximity);
    }
  }, [wellIdandProximity]);

  const map = useMap();
  const mapRequestContext = useContext(MapRequestContext);
  const { layersSelected } = mapRequestContext;
  const [lastRequestPushed, setLastRequestPushed] = useState(null);

  useMapEvent('moveend', () => {
    startFetchingLayers();
  });

  useEffect(() => {
    startFetchingLayers();
  }, []);

  //function that compares last extent with the ones in the queue and deletes queue extents that are no more needed
  const qRemove = (lastReqPushed: any, newArray: any) => {
    q.remove((worker: any) => {
      if (worker.data && lastReqPushed?.extent) {
        if (
          !turf.booleanWithin(worker.data.extent, lastReqPushed.extent) &&
          !turf.booleanOverlap(worker.data.extent, lastReqPushed.extent)
        ) {
          console.log('%cThe new extent does not overlap with and not inside of previous extent!', 'color:red');
          return true;
        }
        if (!newArray.includes(worker.data.BCGWcode)) {
          console.log('%cThe worker in a queue no longer needed as the layers have been changed!', 'color:red');
          return true;
        }
      }
      return false;
    });
  };

  //this is called on map load and each time the map is moved
  const startFetchingLayers = () => {
    const newArray = [];
    layersSelected.forEach((layer: any) => {
      newArray.push(layer.BCGWcode);
    });

    qRemove(lastRequestPushed, newArray);

    if (newArray.length > 0) {
      newArray.forEach((layer) => {
        q.push({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer }, getLayerData);

        setLastRequestPushed({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer });
      });
    }
    map.invalidateSize();
  };

  //gets layer data based on the layer name
  const getLayerData = async () => {
    const mapExtent = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
    if (props.dataBCLayerName === 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW') {
      const largeGridRes = await query(
        {
          type: QueryType.RAW_SQL,
          sql: `SELECT * FROM LARGE_GRID_LAYER_DATA WHERE layerName IN ('well');`
        },
        databaseContext
      );

      let largeGridItemIdString = '(';
      let largeGridResIndex = 0;
      largeGridRes.forEach((gridItem) => {
        if (largeGridResIndex === largeGridRes.length - 1) {
          largeGridItemIdString += gridItem.id + ')';
        } else {
          largeGridItemIdString += gridItem.id + ',';
        }
        largeGridResIndex++;
      });

      const smallGridRes = await query(
        {
          type: QueryType.RAW_SQL,
          sql: `SELECT * FROM SMALL_GRID_LAYER_DATA WHERE layerName IN ('well') AND largeGridID IN ${largeGridItemIdString};`
        },
        databaseContext
      );

      let allFeatures = [];

      smallGridRes.forEach((row) => {
        const featureArea = JSON.parse(row.featureArea).geometry;
        const featuresInArea = JSON.parse(row.featuresInArea);

        if (turf.booleanContains(mapExtent, featureArea) || turf.booleanOverlap(mapExtent, featureArea)) {
          allFeatures = allFeatures.concat(featuresInArea);
        }
      });
      if (props.inputGeo) {
        setWellsWithClosest(getClosestWellToPolygon(allFeatures));
      } else {
        setWellsWithClosest(allFeatures);
      }
      setKeyval(Math.random()); //NOSONAR
    } else {
      const largeGridRes = await query(
        {
          type: QueryType.RAW_SQL,
          sql: `SELECT * FROM LARGE_GRID_LAYER_DATA WHERE layerName IN ('well');`
        },
        databaseContext
      );

      let largeGridItemIdString = '(';
      let largeGridResIndex = 0;
      largeGridRes.forEach((gridItem) => {
        if (largeGridResIndex === largeGridRes.length - 1) {
          largeGridItemIdString += gridItem.id + ')';
        } else {
          largeGridItemIdString += gridItem.id + ',';
        }
        largeGridResIndex++;
      });

      const smallGridRes = await query(
        {
          type: QueryType.RAW_SQL,
          sql: `SELECT * FROM SMALL_GRID_LAYER_DATA WHERE layerName IN ('well') AND largeGridID IN ${largeGridItemIdString};`
        },
        databaseContext
      );
      let allFeatures = [];
      smallGridRes.forEach((row) => {
        const featuresInArea = JSON.parse(row.featuresInArea);
        allFeatures = allFeatures.concat(featuresInArea);
      });
      setGeosToRender(allFeatures);
      setKeyval(Math.random()); //NOSONAR
    }
  };

  // Function for going through array and labeling 1 closest well and wells inside the polygon
  const getClosestWellToPolygon = (arrayOfWells) => {
    let index = 0;
    let nearestWellIndex = null;
    let minDistanceKm = null;
    let wellInside = false;
    if (
      turf.booleanWithin(props.inputGeo[0].geometry as any, createPolygonFromBounds(map.getBounds(), map).toGeoJSON())
    ) {
      arrayOfWells.forEach((well) => {
        const turfPolygon = polygon((props.inputGeo[0].geometry as any).coordinates);
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

  //this is used to display all geoJSON data except for wells
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
