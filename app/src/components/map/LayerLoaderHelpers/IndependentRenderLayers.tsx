import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext } from 'react';
import { ActivitiesLayer } from './ActivitiesLayer';
import { JurisdictionsLayer } from './JurisdictionsLayer';
import { PoisLayer } from './PoisLayer';
import { RISOLayer } from './RISOLayer';

export enum IndependentLayers {
  Activities = 'activities',
  Iapp = 'iapp',
  InvasivesBC = 'invasivesbc',
  Other = 'other'
}

export const IndependentLayer = (props) => {
  const networkContext = useContext(NetworkContext);

  if (Object.values(IndependentLayers).includes(props.source)) {
    switch (props.source) {
      case 'activities':
        return (
          <ActivitiesLayer
            layer_code={props.layer_code}
            color_code={props.color_code}
            online={networkContext.connected}
            opacity={props.opacity}
            zIndex={props.zIndex}
          />
        );
      case 'iapp':
        return (
          <PoisLayer
            color_code={props.color_code}
            online={networkContext.connected}
            opacity={props.opacity}
            zIndex={props.zIndex}
          />
        );
      case 'invasivesbc':
        if (props.layer_code === 'JURISDICTION_LAYER') {
          return (
            <JurisdictionsLayer
              color_code={props.color_code}
              online={networkContext.connected}
              opacity={props.opacity}
              zIndex={props.zIndex}
            />
          );
        }
        if (props.layer_code === 'RISO_BOUNDARIES') {
          return (
            <RISOLayer
              color_code={props.layer_code}
              online={networkContext.connected}
              opacity={props.opacity}
              zIndex={props.zIndex}
            />
          );
        }
        return <></>;
      default:
        return <></>;
    }
  } else {
    throw new Error('something went wrong');
  }
};
