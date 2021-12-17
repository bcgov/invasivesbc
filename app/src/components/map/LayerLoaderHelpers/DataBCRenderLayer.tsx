import React from 'react';
import { WMSTileLayer } from 'react-leaflet';
import { RenderVectorTilesOffline } from './RenderVectorTilesOffline';
import { RenderWFSFeatures } from './RenderWFSFeatures';

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
  console.log(props.layer_mode);
  switch (props.layer_mode) {
    case LayerMode.WMSOnline:
      return (
        <WMSTileLayer
          key={Math.random()}
          transparent={true}
          opacity={props.opacity}
          format={'image/png'}
          url="http://openmaps.gov.bc.ca/geo/ows"
          layers={props.bcgw_code}
          zIndex={props.zIndex}
        />
      );
    case LayerMode.WFSOnline:
      return (
        <RenderWFSFeatures
          inputGeo={props.inputGeo}
          online={true}
          opacity={props.opacity}
          dataBCLayerName={props.bcgw_code}
          setWellIdandProximity={props.setWellIdandProximity}
        />
      );
    case LayerMode.VectorTilesOnline:
    case LayerMode.VectorTilesOffline:
      return <RenderVectorTilesOffline opacity={props.opacity} dataBCLayerName={props.layerName} />;
    case LayerMode.WFSOffline:
      //this is the regular geojson stuff
      return (
        <RenderWFSFeatures
          inputGeo={props.inputGeo}
          online={false}
          opacity={props.opacity}
          dataBCLayerName={props.layerName}
          setWellIdandProximity={props.setWellIdandProximity}
        />
      );
    default:
      return <></>;
  }
};
