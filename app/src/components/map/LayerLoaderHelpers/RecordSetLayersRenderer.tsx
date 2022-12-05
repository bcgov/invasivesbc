import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { createRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  //const layerRef = useRef();
  //const groupRef = useRef();

  useEffect(() => {
    if (!map || !props.layerRef?.current || !props.groupRef?.current) {
      return;
    } else {
      console.log('stuff is ok');
    }
    try {
      //console.dir(markersCanvas);
      //const clear = (markersCanvas as any)?.clear();
      //const remove = (markersCanvas as any)?.removeMarkers();
      //map.removeLayer(markersCanvas);
    } catch (e) {}
    //const container = context.layerContainer || context.map;

    //layerRef.current = new (L as any).MarkersCanvas();

    //groupRef.current = (L as any).layerGroup().addLayer(layerRef.current, { pane: props.key }).addTo(container);
    //  groupRef.current = (L as any).layerGroup().addLayer(layerRef.current).addTo(container);
    // console.log('setting z index');
    // console.log(props.zIndex);
    // groupRef?.current?.setZIndex(props.zIndex);
    // console.log('z index');
    // console.log(groupRef.current.zIndex);

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

    if (props.enabled && props.groupRef) {
      if (props.layerRef) {
        console.log('adding markers');
      }
      props.layerRef?.current?.clear();
      props.groupRef?.current?.setZIndex(props.zIndex);
      props.layerRef?.current?.addMarkers(markers);
      props.groupRef?.current?.setZIndex(props.zIndex);
    }

    // groupRef.current.setZIndex(props.zIndex);
    /*const acleanupCallback = () => mc.removeMarkers(markers);
    setCleanupCallback(acleanupCallback);
    */

    //setMarkersCanvas(mcLayer);
    /*
    setTimeout(() => {

    }, 5000);
    */
    //props.layerRef?.current?.redraw();
    return () => {
      console.log('in cleanup');
      //container.removeLayer(layerRef.current);
      /*container.removeLayer(groupRef.current);
      if (container) {
        //layerRef.current.removeMarkers(markers);
      }
      try {
        //acleanupCallback();
        //(markersCanvas as any)?.removeMarkers();
        // (markersCanvas as any)?.clear();
      } catch (e) {}
    };
    */
    };
    //}, [map]);
  }, [props.colour, props.enabled, props.points, props.groupRef?.current, props.layerRef?.current]);

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
    if (!mapState.layers || mapState.layers === null || mapState.layers === undefined) {
      return <></>;
    }
    return (
      <>
        {Object.keys(mapState?.layers).map((layerKey) => {
          const layer = mapState.layers[layerKey];
          if (!layer) return <></>;
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
    const map = useMap();
    const context = useLeafletContext();
    const layerRefs = useRef([]);
    const groupRefs = useRef([]);
    const [save, setSave] = useState(Math.random());
    try {
      //console.dir(markersCanvas);
      //const clear = (markersCanvas as any)?.clear();
      //const remove = (markersCanvas as any)?.removeMarkers();
      //map.removeLayer(markersCanvas);
    } catch (e) {}
    const container = context.layerContainer || context.map;
    /*
    layerRef.current = new (L as any).MarkersCanvas();

    //groupRef.current = (L as any).layerGroup().addLayer(layerRef.current, { pane: props.key }).addTo(container);
    groupRef.current = (L as any).layerGroup().addLayer(layerRef.current).addTo(container);
    // console.log('setting z index');
    // console.log(props.zIndex);
    groupRef?.current?.setZIndex(props.zIndex);
    */

    useEffect(() => {
      {
        if (!map) return;
        if (!mapState.layers || mapState.layers === null || mapState.layers === undefined) {
          return;
        }
        Object.keys(mapState?.layers).map((layerKey) => {
          if (layerRefs.current[layerKey]) {
            if (groupRefs.current[layerKey]) {
              groupRefs.current[layerKey].current.setZIndex(mapState.layers[layerKey].layerState.drawOrder);
            }
          } else {
            layerRefs.current[layerKey] = createRef();
            layerRefs.current[layerKey].current = new (L as any).MarkersCanvas();
            groupRefs.current[layerKey] = createRef();
            groupRefs.current[layerKey].current = (L as any)
              .layerGroup()
              .addLayer(layerRefs.current[layerKey].current)
              .addTo(container);
            console.log('draw order', mapState?.layers[layerKey].layerState.drawOrder);
            groupRefs.current[layerKey].current.setZIndex(mapState.layers[layerKey].layerState.drawOrder);
          }
        });
      }
      console.dir(groupRefs?.current);
      console.dir(groupRefs?.current[1]);
      setSave(Math.random());
      return () => {
        layerRefs.current.map((lr) => {
          container.removeLayer(lr.current);
        });
        groupRefs.current.map((lr) => {
          container.removeLayer(lr.current);
        });
        //container.removeLayer(layerRef.current);
        /*container.removeLayer(groupRef.current);
         */
      };
      //`}, [mapState.layers]);
    }, []);

    if (!mapState.layers || mapState.layers === null || mapState.layers === undefined || !groupRefs.current) {
      console.log('returning nothing');
      return <></>;
    }
    console.log('returning something');
    return (
      <>
        {save}
        {Object.keys(mapState?.layers).map((layerKey) => {
          const layer = mapState.layers[layerKey];
          if (!layer || !groupRefs.current[layerKey]) {
            return <></>;
          }
          if (layer.layerState.mapToggle && layer.type === 'POI') {
            const filtered = mapState?.IAPPGeoJSON?.features.filter((row) => {
              return layer?.IDList?.includes(row.properties.site_id);
            });

            const featureCollection = { type: 'FeatureCollection', features: filtered };
            console.dir('group ref before render');
            console.log(layerKey);
            console.dir(groupRefs.current[layerKey]);

            return (
              <LeafletCanvasMarker
                key={'POIlayerg2' + layerKey}
                layerRef={layerRefs.current[layerKey]}
                groupRef={groupRefs.current[layerKey]}
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
