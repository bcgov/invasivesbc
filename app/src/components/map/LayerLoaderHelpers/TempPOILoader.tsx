import { Feature, GeoJsonObject } from 'geojson';
import { useDataAccess } from 'hooks/useDataAccess';
import { IPointOfInterestSearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import * as L from 'leaflet';
import React, { useEffect, useState } from 'react';
import { Marker, useMapEvent } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import IAPPSiteMarker from '../Icons/pinned.png';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

var IAPPSite = L.icon({
  iconUrl: IAPPSiteMarker,
  //shadowUrl: 'leaf-shadow.png',
  iconSize: [38, 95], // size of the icon
  //shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  //shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
  className: 'greenIconFilter'
});

const TempPOILoader: React.FC<any> = (props) => {
  const da = useDataAccess();
  const [allPOIS, setAllPOIS] = useState(null);
  const [updatedFilter, setUpdatedFilter] = useState(props.pointOfInterestFilter);

  const map = useMapEvent('zoomend', () => {
    const ltlngbounds = map.getBounds();
    const polygon = createPolygonFromBounds(ltlngbounds, map);
    const geoJSON = polygon.toGeoJSON();

    setUpdatedFilter({ ...props.pointOfInterestFilter, search_feature: geoJSON });
  });
  const loadData = async () => {
    //getPOIS((props as any).pointOfInterestFilter);
    getPOIS(updatedFilter);
  };

  console.log('everything rerendering');
  //load once
  useEffect(() => {
    loadData();
  }, [updatedFilter]);
  const getPOIS = async (filter: IPointOfInterestSearchCriteria) => {
    console.log('here is the filter for POIs', filter);
    let data = await da.getPointsOfInterest(filter);
    let poiGeoJSON = {
      type: 'FeatureCollection',
      features: data.map((row) => {
        return {
          type: 'Feature',
          //TODO do this part server side to speed it up:
          geometry: {
            ...row.point_of_interest_payload.geometry[0].geometry,
            properties: {
              recordDocID: row.id,
              recordDocType: row.docType,
              description: 'New Point of Interest:\n ' + row.id + '\n',

              // basic display:
              color: '#99E472',
              zIndex: 99999
            }
          }
          // interactive
        } as Feature;
      })
    } as GeoJsonObject;
    setAllPOIS(poiGeoJSON);
    // we look at poiGeoJSON and not allPOIS to avoid race condition:
    let page = 2;
    const startTime = new Date();
    while ((poiGeoJSON as any).features.length < data.count) {
      console.log((poiGeoJSON as any).features.length);
      console.log('of ' + data.count);
      console.log('page: ' + page);
      let newFilter = filter;
      newFilter.page = page;
      data = await da.getPointsOfInterest(filter);
      poiGeoJSON = {
        type: 'FeatureCollection',
        features: [
          ...data.map((row) => {
            return {
              type: 'Feature',
              geometry: {
                ...row.point_of_interest_payload.geometry[0].geometry,
                properties: {
                  recordDocID: row.id,
                  recordDocType: row.docType,
                  description: 'New Point of Interest:\n ' + row.id + '\n',

                  // basic display:
                  color: '#99E472',
                  zIndex: 99999
                }
              }
              // interactive
            } as Feature;
          }),
          ...(poiGeoJSON as any).features
        ]
      } as GeoJsonObject;
      setAllPOIS(poiGeoJSON);
      page += 1;
    }
  };
  return (
    <MarkerClusterGroup chunkedLoading>
      {allPOIS?.features?.map((geo: any, index: any) => {
        return (
          <Marker
            key={index}
            position={[geo.geometry.coordinates[1], geo.geometry.coordinates[0]]}
            icon={IAPPSite}></Marker>
        );
      })}
    </MarkerClusterGroup>
  );
};

export default TempPOILoader;
