import React from 'react';
import { WMSTileLayer } from 'react-leaflet';
import { RenderWFSFeatures } from './RenderWFSFeatures';
import { RenderVectorTilesOffline } from './RenderVectorTilesOffline';
import { ActivitiesLayer } from './ActivitiesLayer';
import { PoisLayer } from './PoisLayer';

export enum LayerMode {
  WMSOnline = 'wms_online',
  WFSOnline = 'wfs_online',
  VectorTilesOffline = 'vector_tiles_offline',
  RegularFeaturesOffline = 'regular_features_offline'
}

export const DataBCLayer = (props) => {
  if (props.layerName === 'LEAN_ACTIVITIES') {
    return <ActivitiesLayer opacity={props.opacity} color={props.color_code} />;
  } else if (props.layerName === 'LEAN_POI') {
    return <PoisLayer opacity={props.opacity} color={props.color_code} />;
  }

  if (!props.mode) {
    throw new Error('you missed a map mode');
  }
  switch (props.mode) {
    case LayerMode.WMSOnline:
      return (
        <WMSTileLayer
          key={Math.random()}
          transparent={true}
          opacity={props.opacity}
          format={'image/png'}
          url="http://openmaps.gov.bc.ca/geo/ows"
          layers={props.layerName}
        />
      );
    case LayerMode.WFSOnline:
      return (
        <RenderWFSFeatures
          inputGeo={props.inputGeo}
          online={true}
          opacity={props.opacity}
          dataBCLayerName={props.layerName}
          setWellIdandProximity={props.setWellIdandProximity}
        />
      );
    case LayerMode.VectorTilesOffline:
      return <RenderVectorTilesOffline opacity={props.opacity} dataBCLayerName={props.layerName} />;
    case LayerMode.RegularFeaturesOffline:
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
