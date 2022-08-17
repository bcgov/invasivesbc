import { Typography } from '@mui/material';
import { polygon } from '@turf/helpers';
import pointToLineDistance from '@turf/point-to-line-distance';
import polygonToLine from '@turf/polygon-to-line';
// import booleanWithin from '@turf/boolean-within';
import inside from '@turf/inside';
import { Feature, Geometry } from 'geojson';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { Layer } from 'leaflet';
import React, { useContext, useEffect, useState } from 'react';
import { GeoJSON, useMap, useMapEvent } from 'react-leaflet';
import { DatabaseContext, query, QueryType } from '../../../contexts/DatabaseContext';
import { MapRequestContext } from '../../../contexts/MapRequestsContext';
import { q } from '../MapContainer';
import { getDataFromDataBC, getStylesDataFromBC } from '../WFSConsumer';
import { fetchLayerDataFromLocal, getStyleForLayerFeature } from './AdditionalHelperFunctions';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';
import { WellMarker } from './WellMarker';
import buffer from '@turf/buffer';

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
}

export const RenderWFSFeatures = (props: IRenderWFSFeatures) => {
  const [wellFeatures, setWellFeatures] = useState(null);
  const [otherFeatures, setOtherFeatures] = useState(null);
  const databaseContext = useContext(DatabaseContext);
  const map = useMap();
  const mapRequestContext = useContext(MapRequestContext);
  const { layers } = mapRequestContext;
  const invasivesApi = useInvasivesApi();
  const [layerStyles, setlayerStyles] = useState(null);

  useMapEvent('moveend', () => {
    fetchLayer();
  });

  useEffect(() => {
    fetchLayer();
  }, [layers]);

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
              ? setWellFeatures(getClosestWellToPolygon(returnVal.features))
              : setWellFeatures(returnVal.features);
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
        console.error('Could not parse features in WFS request:', err);
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
    const outputWells = [];
    let geoJSONFeature = props.inputGeo[0];

    if (geoJSONFeature.geometry.type === 'Point') {
      let radius = 100;
      if (geoJSONFeature.properties?.radius) {
        radius = geoJSONFeature.properties.radius;
      }
      geoJSONFeature = buffer(geoJSONFeature, radius, { units: 'meters' });
    }

    // if (booleanWithin(geoJSONFeature as any, createPolygonFromBounds(map.getBounds(), map).toGeoJSON())) {
    const turfPolygon = polygon((geoJSONFeature.geometry as any).coordinates);

    if (arrayOfWells.length < 1) {
      return arrayOfWells;
    }
    arrayOfWells.forEach((well, index) => {
      if (inside(well, turfPolygon)) {
        outputWells.push({ ...well, inside: true });
      } else {
        outputWells.push({ ...well, proximity: pointToLineDistance(well, polygonToLine(turfPolygon)) * 1000 });
      }
    });
    //sort by proximity ASC
    outputWells.sort((wellA, wellB) => {
      return wellA.proximity - wellB.proximity;
    });

    outputWells[0] = { ...outputWells[0], closest: true };

    return outputWells;
    // }
    // else{

    // }
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
        wellFeatures &&
        wellFeatures.length > 0 &&
        wellFeatures.map((feature) => {
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
