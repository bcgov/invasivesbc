import React from 'react';
import { WMSTileLayer } from 'react-leaflet';
import { RenderWFSFeatures } from './RenderWFSFeatures';
import { RenderVectorTilesOffline } from './RenderVectorTilesOffline';
import { ActivitiesLayer } from './ActivitiesLayer';
import { PoisLayer } from './PoisLayer';
import { JurisdictionsLayer } from './JurisdictionsLayer';

export enum LayerMode {
  WMSOnline = 'wms_online',
  WFSOnline = 'wfs_online',
  VectorTilesOffline = 'vector_tiles_offline',
  RegularFeaturesOffline = 'regular_features_offline'
}

export enum IndependentLayers {
  Activities = 'LEAN_ACTIVITIES',
  POI = 'LEAN_POI',
  Jurisdictions = 'jurisdiction'
}

export const DataBCLayer = (props) => {
  if (Object.values(IndependentLayers).includes(props.layerName)) {
    switch (props.layerName) {
      case 'LEAN_ACTIVITIES':
        return <ActivitiesLayer opacity={props.opacity} />;
      case 'LEAN_POI':
        return <PoisLayer opacity={props.opacity} />;
      case 'jurisdiction':
        return <JurisdictionsLayer opacity={props.opacity} />;
      default:
        return <></>;
    }
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
