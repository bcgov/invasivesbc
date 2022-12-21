import React, { useContext } from 'react';
import { ActivitiesLayer } from './ActivitiesLayer';
import { JurisdictionsLayer } from './JurisdictionsLayer';
import { PoisLayer } from './PoisLayer';
import { RISOLayer } from './RISOLayer';
import { AdminUploadsLayer } from './AdminUploadsLayer';
import { selectNetworkConnected } from '../../../state/reducers/network';
import { useSelector } from '../../../state/utilities/use_selector';

export enum IndependentLayers {
  Activities = 'LEAN_ACTIVITIES',
  Iapp = 'LEAN_POI',
  RISO = 'RISO_BOUNDARIES',
  Jurisdictions = 'JURISDICTION_LAYER',
  ADMIN_KML = 'ADMIN_UPLOADS',
  Other = 'other'
}

export const IndependentLayer = (props) => {
  const connected = useSelector(selectNetworkConnected);

  if (!props.enabled) {
    return <></>;
  }
  if (Object.values(IndependentLayers).includes(props.layer_code)) {
    switch (props.layer_code) {
      case 'JURISDICTION_LAYER':
        return (
          <JurisdictionsLayer
            color_code={props.color_code}
            online={connected}
            opacity={props.opacity}
            zIndex={props.zIndex}
          />
        );
      case 'RISO_BOUNDARIES':
        return (
          <RISOLayer color_code={props.color_code} online={connected} opacity={props.opacity} zIndex={props.zIndex} />
        );
      case 'ADMIN_UPLOADS':
        return (
          <AdminUploadsLayer
            color_code={props.color_code}
            geoJSON={props.geoJSON}
            online={connected}
            opacity={props.opacity}
            zIndex={props.zIndex}
          />
        );
      default:
        return <></>;
    }
  } else {
    throw new Error('something went wrong');
  }
};
