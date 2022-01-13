import { Typography } from '@material-ui/core';
import { polygon } from '@turf/helpers';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
import * as turf from '@turf/turf';
import { Feature, Geometry } from 'geojson';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { Layer } from 'leaflet';
import { features } from 'process';
import React, { useContext, useEffect, useState } from 'react';
import { GeoJSON, useMap, useMapEvent } from 'react-leaflet';
import { DatabaseContext, query, QueryType } from '../../../contexts/DatabaseContext';
import { MapRequestContext } from '../../../contexts/MapRequestsContext';
import { q } from '../MapContainer';
import { getDataFromDataBC, getStylesDataFromBC } from '../WFSConsumer';
import { fetchLayerDataFromLocal, getStyleForLayerFeature } from './AdditionalHelperFunctions';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { WellMarker } from './WellMarker';

interface IRenderWFSFeatures {
  inputGeo: Feature;
  dataBCLayerName;
  online: boolean;
  opacity?: number;
  featureType?: string;
  memoHash?: string;
  customOnEachFeature?: any;
  dataBCAcceptsGeometry?: boolean;
  simplifyPercentage: number;
  setWellIdandProximity?: (wellIdandProximity: any) => void;
}

export const RenderWFSFeatures = (props: IRenderWFSFeatures) => {
  const [wellFeatures, setWellFeatures] = useState(null);
  const [wellIdandProximity, setWellIdandProximity] = useState(null);
  const [otherFeatures, setOtherFeatures] = useState(null);
  const databaseContext = useContext(DatabaseContext);
  const map = useMap();
  const mapRequestContext = useContext(MapRequestContext);
  const { layers } = mapRequestContext;
  const invasivesApi = useInvasivesApi();
  const [layerStyles, setlayerStyles] = useState(null);

  //when there is new wellId and proximity, send info to ActivityPage
  useEffect(() => {
    if (props.setWellIdandProximity) {
      props.setWellIdandProximity(wellIdandProximity);
    }
  }, [wellIdandProximity]);

  useMapEvent('moveend', () => {
    fetchLayer();
  });

  useEffect(() => {
    fetchLayer();
  }, [layers]);

  // function that compares last extent (with layers selected for it)
  // with the ones in the queue and deletes queue extents that are no longer needed
  // const qRemove = (lastReqPushed: any, newArray: any) => {
  // q.remove((worker: any) => {
  //   if (worker.data && lastReqPushed?.extent) {
  //     if (
  //       !turf.booleanWithin(worker.data.extent, lastReqPushed.extent) &&
  //       !turf.booleanOverlap(worker.data.extent, lastReqPushed.extent)
  //     ) {
  //       console.log('%cThe new extent does not overlap with and not inside of previous extent!', 'color:red');
  //       return true;
  //     }
  //     if (!newArray.includes(worker.data.BCGWcode)) {
  //       console.log('%cThe worker in a queue no longer needed as the layers have been changed!', 'color:red');
  //       return true;
  //     }
  //   }
  //   return false;
  // });
  // };

  const fetchLayer = () => {
    q.push(
      {
        extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(),
        layer: props.dataBCLayerName,
        func: getLayerData
      },
      (err) => {
        if (err) console.log('There has been an error: ' + err);
      }
    );
  };

  //this is called on map load and each time the map is moved
  // const startFetchingLayers = () => {
  //   const newLayerArray = [];
  //   layers.forEach((parentLayer: any) => {
  //     parentLayer.children.forEach((childLayer) => {
  //       if (childLayer.enabled) {
  //         if (childLayer.layer_code) {
  //           newLayerArray.push(childLayer.layer_code);
  //         } else if (childLayer.bcgw_code) {
  //           newLayerArray.push(childLayer.bcgw_code);
  //         }
  //       }
  //     });
  //   });

  //   //calling function to remove no longer needed elements from the queue
  //   qRemove(lastRequestPushed, newLayerArray);

  //   //if there are layers selected
  //   if (newLayerArray.length > 0) {
  //     //for each layer, push it and the map extent to the queue
  //     //also set last request pushed use state var to use it in qRemove function
  //     newLayerArray.forEach((layer) => {
  //       q.push({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer }, getLayerData);
  //       setLastRequestPushed({ extent: createPolygonFromBounds(map.getBounds(), map).toGeoJSON(), layer: layer });
  //     });
  //   }
  //   //this just rerenders the map
  //   map.invalidateSize();
  // };

  //gets layer data based on the layer name
  const getLayerData = async () => {
    //get the map extent as geoJson polygon feature
    const mapExtent = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
    //if well layer is selected
    //if online, just get data from WFSonline consumer
    if (props.online) {
      getStylesDataFromBC(props.dataBCLayerName).then((returnStyles) => {
        setlayerStyles(returnStyles);

        getDataFromDataBC(
          props.dataBCLayerName,
          mapExtent,
          invasivesApi.getSimplifiedGeoJSON,
          props.dataBCAcceptsGeometry
        ).then((returnVal) => {
          if (props.dataBCLayerName === 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW') {
            props.inputGeo && props.inputGeo[0]
              ? setWellFeatures(getClosestWellToPolygon(returnVal))
              : setWellFeatures(returnVal);
          } else {
            setOtherFeatures(returnVal);
          }
        }, []);
      });
    }
    //if offline: try to get layer data from sqlite local storage
    else {
      const returnStyles = await databaseContext.asyncQueue({
        asyncTask: () => {
          return query(
            {
              type: QueryType.RAW_SQL,
              sql: `SELECT json FROM LAYER_STYLES WHERE layerName='${props.dataBCLayerName}';`
            },
            databaseContext
          );
        }
      });
      // alert(returnStyles[0].json);

      /**
       * It is possible to get no features in the returned object. 
       * With some testing it was also discovered that DataBC
       * returns no feature even requesting an area within a large
       * polygon.
       */
      try {
        setlayerStyles(JSON.parse(returnStyles[0].json));
      } catch (err) {
        console.error("Could not parse features in WFS request:",err);
      }

      const allFeatures = await fetchLayerDataFromLocal(props.dataBCLayerName, mapExtent, databaseContext);

      //set useState var to display features
      if (props.dataBCLayerName === 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW') {
        //if there is a geometry drawn, get closest wells and wells inside and label them
        props.inputGeo && (props.inputGeo as any).length > 0
          ? setWellFeatures(getClosestWellToPolygon(allFeatures))
          : setWellFeatures(allFeatures);
      } else {
        setOtherFeatures(allFeatures);
      }
    }
  };

  // Function for going through array of wells and labeling 1 closest well and wells inside the polygon
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
        // Catch the posibility of no features being returned
        let wfsProperties = {};
        if (feature.properties) {
          wfsProperties = feature.properties;
        }
        layer.bindPopup(
          '<table>' +
            '<tr><th style="font-size: 1.2rem">Property</th><th style="font-size: 1.2rem">Value</th></tr>' +
            Object.keys(wfsProperties).map((key) => {
              return '<tr><td><b>' + key + '</b></td><td>' + wfsProperties[key] + '</td></tr>';
            }) +
            '</table>'
        );
      };

  return (
    <>
      {otherFeatures && layerStyles && (
        <GeoJSON
          key={Math.random() + otherFeatures.length}
          onEachFeature={onEachFeature}
          style={function (geoJsonFeature) {
            return { ...getStyleForLayerFeature(geoJsonFeature, layerStyles, props.opacity), zIndex: 99999999 };
          }}
          data={otherFeatures}></GeoJSON>
      )}
      {wellFeatures &&
        wellFeatures.features.map((feature) => {
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
