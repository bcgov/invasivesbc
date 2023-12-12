import { CRS } from 'leaflet';
import React from 'react';
import { useMap, WMSTileLayer } from 'react-leaflet';
//import { RenderVectorTilesOffline } from './RenderVectorTilesOffline';
//import { RenderWFSFeatures } from './RenderWFSFeatures';

export enum LayerMode {
  WMSOnline = 'wms_online',
  WFSOnline = 'wfs_online',
  WFSOffline = 'wfs_offline',
  VectorTilesOnline = 'vector_tiles_online',
  VectorTilesOffline = 'vector_tiles_offline',
  RegularFeaturesOffline = 'regular_features_offline'
}

export const DataBCLayer = (props) => {
  if (!props.layer_mode) {
    throw new Error('you missed a map mode');
  }

  if (!props.enabled) {
    return <></>;
  }
  switch (props.layer_mode) {
    case LayerMode.WMSOnline:
      return (
        <WMSTileLayer
          transparent={true}
          opacity={props.opacity}
          format={'image/png'}
          url="http://openmaps.gov.bc.ca/geo/ows"
          layers={props.bcgw_code}
          zIndex={props.zIndex}
        />
      );
    /* case LayerMode.WFSOnline:
      return (
        <RenderWFSFeatures
          inputGeo={props.inputGeo}
          online={true}
          dataBCAcceptsGeometry={props.dataBCAcceptsGeometry}
          simplifyPercentage={props.simplifyPercentage}
          opacity={props.opacity}
          dataBCLayerName={props.bcgw_code}
        />
      );*/
    case LayerMode.VectorTilesOnline:
    case LayerMode.VectorTilesOffline:
    //  return <RenderVectorTilesOffline opacity={props.opacity} dataBCLayerName={props.layerName} />;
    case LayerMode.WFSOffline:
      //this is the regular geojson stuff
      return null; //(
    /*   <RenderWFSFeatures
          inputGeo={props.inputGeo}
          online={false}
          dataBCAcceptsGeometry={props.dataBCAcceptsGeometry}
          simplifyPercentage={props.simplifyPercentage}
          opacity={props.opacity}
          dataBCLayerName={props.bcgw_code}
        />*/
    //  );
    default:
      return <></>;
  }
};
