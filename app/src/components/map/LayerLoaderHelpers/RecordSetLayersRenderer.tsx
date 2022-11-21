import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivitiesLayerV2 } from './ActivitiesLayerV2';
import { useSelector } from '../../../state/utilities/use_selector';
import { selectAuth } from '../../../state/reducers/auth';
import { selectActivities } from 'state/reducers/activities';
import { useMap } from 'react-leaflet';

import L from 'leaflet';

//const  glify } = require('react-leaflet-glify');
//import glify from 'react-leaflet-glify';
import { glify } from 'react-leaflet-glify';
//import 'leaflet-canvas-marker';
import 'leaflet-markers-canvas';

export const LeafletCanvasMarker = (props) => {
  const map = useMap();

  const [markersCanvas, setMarkersCanvas] = useState();

  useEffect(() => {
    if (!map) return;

    const mc = new (L as any).MarkersCanvas();
    mc.addTo(map);

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

    var greenIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      iconSize: [12, 10],
      iconAnchor: [10, 9]
    });

    var icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [12, 10],
      iconAnchor: [10, 9]
    });

    var markers = [];
    props.points?.features?.map((point) => {
      if (!(point?.geometry?.coordinates?.length > 0)) {
        return;
      }
      var marker = L.marker([point.geometry.coordinates[1], point.geometry.coordinates[0]], {
        icon: props.colour === '#21f34f' ? greenIcon : icon
      }); //?.bindPopup('I Am ' + point.properties);
      markers.push(marker);
    });
    /*    if (markers.length > 0) ciLayer.addLayers(markers);
    return () => {
      map.removeLayer(ciLayer);
    };
    */
    mc.addMarkers(markers);
    setMarkersCanvas(mc);

    return () => {};
    //}, [map]);
  }, []);

  return <></>;
};

export const RecordSetLayersRenderer = (props: any) => {
  const { accessRoles } = useSelector(selectAuth);
  const activitiesState = useSelector(selectActivities);

  interface ILayerToRender {
    filter: IActivitySearchCriteria;
    color: any;
    setName: string;
  }

  return (
    <>
      {activitiesState?.activitiesGeoJSON?.map((l) => {
        //if (l && l.layerState.color) {
        if (l.layerState.enabled) {
          return (
            <ActivitiesLayerV2
              key={'activitiesv2filter' + l.recordSetID}
              activities={l.featureCollection}
              zIndex={999999999 - l.layerState.drawOrder}
              color={l.layerState.color}
              opacity={0.8}
            />
          );
        }
      })}
      {activitiesState?.IAPPGeoJSON?.length > 0 ? (
        activitiesState?.IAPPGeoJSON?.map((l) => {
          //if (l && l.layerState.color) {
          if (l?.featureCollection?.features?.length > 0 && l.layerState.enabled && activitiesState?.IAPPRecordSetIDS) {
            const filtered = {
              ...l.featureCollection,
              features: l.featureCollection.features.filter((row) => {
                return activitiesState?.IAPPRecordSetIDS[l?.recordSetID]?.includes(row.properties.site_id);
              })
            };
            {
              /*<GLLayerPoints points={l.featureCollection}></GLLayerPoints>
                <ActivitiesLayerV2
                  key={'activitiesv2filter' + l.recordSetID}
                  activities={l.featureCollection}
                  zIndex={999999999 - l.layerState.drawOrder}
                  ids={activitiesState?.IAPPRecordSetIDS[l?.recordSetID]}
                  color={l.layerState.color}
                  isIAPP={true}
                  opacity={0.8}
            />*/
            }
            return (
              <LeafletCanvasMarker
                key={'activitieslayerg2' + l.recordSetID}
                points={filtered}
                colour={l.layerState.color}
              />
            );
          }
        })
      ) : (
        <></>
      )}
    </>
  );
};
