import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext } from 'react';
import { ActivitiesLayer } from './ActivitiesLayer';
import { JurisdictionsLayer } from './JurisdictionsLayer';
import { PoisLayer } from './PoisLayer';
import { RISOLayer } from './RISOLayer';

export enum IndependentLayers {
  Activities = 'LEAN_ACTIVITIES',
  POI = 'LEAN_POI',
  Jurisdictions = 'JURISDICTIONS',
  RISO = 'RISO'
}

export const IndependentLayer = (props) => {
  const networkContext = useContext(NetworkContext);
  if (Object.values(IndependentLayers).includes(props.layer_code.toUpperCase())) {
    switch (props.layer_code) {
      case 'LEAN_ACTIVITIES':
        return (
          <ActivitiesLayer
            color_code={props.color_code}
            online={networkContext.connected}
            opacity={props.opacity}
            zIndex={props.zIndex}
          />
        );
      case 'LEAN_POI':
        return (
          <PoisLayer
            color_code={props.color_code}
            online={networkContext.connected}
            opacity={props.opacity}
            zIndex={props.zIndex}
          />
        );
      case 'JURISDICTIONS':
        return (
          <JurisdictionsLayer
            color_code={props.color_code}
            online={networkContext.connected}
            opacity={props.opacity}
            zIndex={props.zIndex}
          />
        );
      case 'RISO':
        return (
          <RISOLayer
            color_code={props.color_code}
            online={networkContext}
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
