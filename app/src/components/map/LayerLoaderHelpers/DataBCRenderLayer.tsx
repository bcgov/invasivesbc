import React from 'react';
import { WMSTileLayer } from 'react-leaflet';

export enum LayerMode {
  WMSOnline = 'wms_online',
  WFSOnline = 'wfs_online',
  VectorTilesOffline = 'vector_tiles_offline',
  RegularFeaturesOffline = 'regular_features_offline'
}

export const DataBCLayer = (props) => {
  if (!props.mode) {
    throw new Error('you missed a map mode');
  }
  switch (props.mode) {
    case LayerMode.WMSOnline:
      return <WMSTileLayer opacity={props.opacity} url="http://openmaps.gov.bc.ca/geo/ows" layers={props.layerName} />;
    case LayerMode.WFSOnline:
      return <></>;
    case LayerMode.VectorTilesOffline:
      return <></>;
    case LayerMode.RegularFeaturesOffline:
      //this is the regular geojson stuff
      return <></>;
  }
};
