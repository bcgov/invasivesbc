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
import { getDataFromDataBC } from '../WFSConsumer';

interface IRenderWFSFeatures {
  inputGeo: Feature;
  dataBCLayerName;
  online: boolean;
  proximityInMeters: number;
  featureType?: string;
  memoHash?: string;
  customOnEachFeature?: any;
  setWellIdandProximity?: (wellIdandProximity: any) => void;
}

export const RenderWFSFeatures = (props: IRenderWFSFeatures) => {
  const [wellsWithClosest, setWellsWithClosest] = useState(null);
  const [wellIdandProximity, setWellIdandProximity] = useState(null);
  const [geosToRender, setGeosToRender] = useState(null);
  const databaseContext = useContext(DatabaseContext2);

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
    const newLayerArray = [];
    layersSelected.forEach((layer: any) => {
      newLayerArray.push(layer.BCGWcode);
    });

    //calling function to remove no longer needed elements from the queue
    qRemove(lastRequestPushed, newLayerArray);

    //if there are layers selected
    if (newLayerArray.length > 0) {
      //for each layer, push it and the map extent to the queue
      //also set last request pushed use state var to use it in qRemove function
      newLayerArray.forEach((layer) => {
        q.push({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer }, getLayerData);
        setLastRequestPushed({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer });
      });
    }
    //this just rerenders the map
    map.invalidateSize();
  };

  //gets layer data based on the layer name
  const getLayerData = async () => {
    //get the map extent as geoJson polygon feature
    const mapExtent = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
    //if well layer is selected
    if (props.dataBCLayerName === 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW') {
      //if online, just get data from WFSonline consumer
      if (props.online) {
        getDataFromDataBC(props.dataBCLayerName, mapExtent).then((returnVal) => {
          props.inputGeo ? setWellsWithClosest(getClosestWellToPolygon(returnVal)) : setWellsWithClosest(returnVal);
        }, []);
      }
      //if offline: try to get layer data from sqlite local storage
      else {
        //first, selecting large grid items with well layer name
        const largeGridRes = await query(
          {
            type: QueryType.RAW_SQL,
            sql: `SELECT * FROM LARGE_GRID_LAYER_DATA WHERE layerName IN ('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW');`
          },
          databaseContext
        );

        //create a string containing all large grid item ids that we got
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

        //select small grid items with well layer name and large grid items id
        const smallGridRes = await query(
          {
            type: QueryType.RAW_SQL,
            sql: `SELECT * FROM SMALL_GRID_LAYER_DATA WHERE layerName IN ('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW') AND largeGridID IN ${largeGridItemIdString};`
          },
          databaseContext
        );

        //foreach small grid item that we got, if grid item intersects with map extent,
        //add it to the array of grid items
        let allFeatures = [];
        smallGridRes.forEach((row) => {
          const featureArea = JSON.parse(row.featureArea).geometry;
          const featuresInArea = JSON.parse(row.featuresInArea);
          if (turf.booleanContains(mapExtent, featureArea) || turf.booleanOverlap(mapExtent, featureArea)) {
            allFeatures = allFeatures.concat(featuresInArea);
          }
        });
        //set useState var to display wells
        props.inputGeo ? setWellsWithClosest(getClosestWellToPolygon(allFeatures)) : setWellsWithClosest(allFeatures);
      }
    } else {
      //if online, just get data from WFSonline consumer
      if (props.online) {
        getDataFromDataBC(props.dataBCLayerName, mapExtent).then((returnVal) => {
          setGeosToRender(returnVal);
        }, []);
      }
      //if offline: try to get layer data from sqlite local storage
      else {
        //getting all the layers except for wells
        const largeGridRes = await query(
          {
            type: QueryType.RAW_SQL,
            sql: `SELECT * FROM LARGE_GRID_LAYER_DATA WHERE layerName NOT IN ('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW');`
          },
          databaseContext
        );

        //create a string containing all large grid item ids that we got
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

        //select small grid items (not well ones) with large grid items id
        const smallGridRes = await query(
          {
            type: QueryType.RAW_SQL,
            sql: `SELECT * FROM SMALL_GRID_LAYER_DATA WHERE layerName NOT IN ('WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW') AND largeGridID IN ${largeGridItemIdString};`
          },
          databaseContext
        );
        let allFeatures = [];

        //foreach small grid item that we got, if grid item intersects with map extent,
        //add it to the array of grid items
        smallGridRes.forEach((row) => {
          const featuresInArea = JSON.parse(row.featuresInArea);
          allFeatures = allFeatures.concat(featuresInArea);
        });
        //set usestate var to render features
        setGeosToRender(allFeatures);
      }
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
      {geosToRender && <GeoJSON key={Math.random()} onEachFeature={onEachFeature} data={geosToRender}></GeoJSON>}
      {wellsWithClosest &&
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
