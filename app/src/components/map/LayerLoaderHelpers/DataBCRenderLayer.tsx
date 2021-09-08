import { Feature } from '@turf/turf';
import React from 'react';
import { useMap, WMSTileLayer } from 'react-leaflet';
import { RenderKeyFeaturesNearFeature } from './DataBCRenderFeaturesNearFeature';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export enum LayerMode {
  WMSOnline = 'wms_online',
  WFSOnline = 'wfs_online',
  VectorTilesOffline = 'vector_tiles_offline',
  RegularFeaturesOffline = 'regular_features_offline'
}

export const DataBCLayer = (props) => {
  const map = useMap();

  if (!props.mode) {
    throw new Error('you missed a map mode');
  }
  switch (props.mode) {
    case LayerMode.WMSOnline:
      return (
        <WMSTileLayer
          transparent={true}
          opacity={props.opacity}
          format={'image/png'}
          url="http://openmaps.gov.bc.ca/geo/ows"
          layers={props.layerName}
        />
      );
    case LayerMode.WFSOnline:
      return <></>;
    case LayerMode.VectorTilesOffline:
      return <></>;
    case LayerMode.RegularFeaturesOffline:
      //this is the regular geojson stuff
      return (
        <RenderKeyFeaturesNearFeature
          inputGeo={createPolygonFromBounds(map.getBounds(), map).toGeoJSON()}
          dataBCLayerName={props.layerName}
          proximityInMeters={550}
          setWellIdandProximity={props.setWellIdandProximity}
        />
      );
  }
};
