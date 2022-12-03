import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';
import { useSelector } from '../../../state/utilities/use_selector';
import { selectAuth } from '../../../state/reducers/auth';
import { selectMap } from 'state/reducers/map';
import { useMap } from 'react-leaflet';

import L from 'leaflet';

//const  glify } = require('react-leaflet-glify');
//import glify from 'react-leaflet-glify';
import { glify } from 'react-leaflet-glify';
//import 'leaflet-canvas-marker';
import 'leaflet-markers-canvas';
import { cleanup } from '@testing-library/react';
import { useLeafletContext } from '@react-leaflet/core';

export const LeafletCanvasMarker = (props) => {
  const map = useMap();

  const context = useLeafletContext();

  const [markersCanvas, setMarkersCanvas] = useState();
  const [markers, setMarkers] = useState([]);
  const [cleanupCallback, setCleanupCallback] = useState();
  const layerRef = useRef();
  const groupRef = useRef();

  useEffect(() => {
    if (!map) return;
    try {
      //console.dir(markersCanvas);
      //const clear = (markersCanvas as any)?.clear();
      //const remove = (markersCanvas as any)?.removeMarkers();
      //map.removeLayer(markersCanvas);
    } catch (e) {}
    const container = context.layerContainer || context.map;

    layerRef.current = new (L as any).MarkersCanvas();

    groupRef.current = (L as any).layerGroup().addLayer(layerRef.current).addTo(container);
    groupRef.current.setZIndex(props.zIndex);

    //    container.addLayer(layerRef.current);

    //const mcLayer = mc.addTo(map);

    // if (markers?.length > 0) mcLayer.removeMarkers(markers);

    //'canvas-marker' way:
    //var ciLayer = (L as any).canvasIconLayer({}).addTo(map);

    /*
    ciLayer.addOnClickListener(function (e, data) {
      console.log(data);
    });
    ciLayer.addOnHoverListener(function (e, data) {
      console.log(data[0].data._leaflet_id);
    });
    */

    /*
    var icon = L.icon({

      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [12, 10],
      iconAnchor: [10, 9]

    });
    */

    let colour = '';
    switch (props.colour) {
      case '#2A81CB':
        colour = 'blue';
        break;
      case '#FFD326':
        colour = 'gold';
        break;
      case '#CB2B3E':
        colour = 'red';
        break;
      case '#2AAD27':
        colour = 'green';
        break;
      case '#CB8427':
        colour = 'orange';
        break;
      case '#CAC428':
        colour = 'yellow';
        break;
      case '#9C2BCB':
        colour = 'violet';
        break;
      case '#7B7B7B':
        colour = 'grey';
        break;
      case '#3D3D3D':
        colour = 'black';
        break;
      default:
        colour = 'blue';
    }
    var icon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + colour + '.png',
      iconSize: [12, 10],
      iconAnchor: [10, 9]
    });

    var markers = [];
    props.points?.features?.map((point) => {
      if (!(point?.geometry?.coordinates?.length > 0)) {
        return;
      }
      var marker = L.marker([point.geometry.coordinates[1], point.geometry.coordinates[0]], {
        icon: icon
      }); //?.bindPopup('I Am ' + point.properties);
      markers.push(marker);
    });
    /*    if (markers.length > 0) ciLayer.addLayers(markers);
    return () => {
      map.removeLayer(ciLayer);
    };
    */
    if (groupRef.current) layerRef?.current?.clear();

    if (props.enabled && groupRef.current) {
      layerRef?.current?.addMarkers(markers);
    }

    /*const acleanupCallback = () => mc.removeMarkers(markers);
    setCleanupCallback(acleanupCallback);
    */

    //setMarkersCanvas(mcLayer);
    setTimeout(() => {
      layerRef?.current?.redraw();
    }, 5000);

    return () => {
      //container.removeLayer(layerRef.current);
      container.removeLayer(groupRef.current);
      if (container) {
        //layerRef.current.removeMarkers(markers);
      }
      try {
        //acleanupCallback();
        //(markersCanvas as any)?.removeMarkers();
        // (markersCanvas as any)?.clear();
      } catch (e) {}
    };
    //}, [map]);
  }, [props.colour, props.enabled, props.points]);

  return <></>;
};

export const RecordSetLayersRenderer = (props: any) => {
  const { accessRoles } = useSelector(selectAuth);
  const mapState = useSelector(selectMap);

  interface ILayerToRender {
    filter: IActivitySearchCriteria;
    color: any;
    setName: string;
  }

  const GLLayerPoints = (props) => {
    const map = useMap();

    useEffect(() => {
      if (map && props.points) {
        //        (L as any).glify = glify;

        (L as any).glify.points({
          map,
          data: props.points,
          size: 10,

          click: (e, pointOrGeoJsonFeature, xy): boolean | void => {
            // do something when a point is clicked
            // return false to continue traversing
          },
          hover: (e, pointOrGeoJsonFeature, xy): boolean | void => {
            // do something when a point is hovered
          }
        });
      }
    }, []);
    return <></>;
  };

  const ActivitiesLayer = (props) => {
    if(!mapState.layers || mapState.layers === null || mapState.layers === undefined)
    {
      return <></>;
    }
    return (
      <>
        {Object.keys(mapState?.layers).map((layerKey) => {
      const layer = mapState.layers[layerKey];
      if(!layer) return <></>
      if (layer?.layerState?.mapToggle && layer?.type !== 'POI') {
        const filtered = mapState?.activitiesGeoJSON?.features.filter((row) => {
          return layer?.IDList?.includes(row.properties.id);
        });

        const featureCollection = { type: 'FeatureCollection', features: filtered };

        return (
          <ActivitiesLayerV2
            key={'activitiesv2filter' + layerKey}
            activities={featureCollection}
            zIndex={999999999 - layer.layerState.drawOrder}
            color={layer.layerState.color}
            opacity={0.8}
              />
            );
          }
        })}
      </>
    );
  };

  const IAPPLayer = (props) => {
    if(!mapState.layers || mapState.layers === null || mapState.layers === undefined)
    {
      return <></>;
    }
    return (
      <>
        {Object.keys(mapState?.layers).map((layerKey) => {
          const layer = mapState.layers[layerKey];
          if(!layer) return <></>
          if (layer.layerState.mapToggle && layer.type === 'POI') {
            const filtered = mapState?.IAPPGeoJSON?.features.filter((row) => {
              return layer?.IDList?.includes(row.properties.site_id);
            });

            const featureCollection = { type: 'FeatureCollection', features: filtered };

            return (
              <LeafletCanvasMarker
                key={'POIlayerg2' + layerKey}
                points={featureCollection}
                enabled={layer.layerState.mapToggle}
                colour={layer.layerState.color}
                zIndex={layer.layerState.drawOrder + 10000}
              />
            );
          }
        })}
      </>
    );
  };

  return (
    <>
      <ActivitiesLayer />
      <IAPPLayer />
    </>
  );
};
