import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext } from 'react';
import { ActivitiesLayer } from './ActivitiesLayer';
import { JurisdictionsLayer } from './JurisdictionsLayer';
import { PoisLayer } from './PoisLayer';

export enum IndependentLayers {
  Activities = 'activities',
  Iapp = 'iapp',
  InvasivesBC = 'invasivesbc',
  Other = 'other'
}

export const IndependentLayer = (props) => {
  const networkContext = useContext(NetworkContext);

  console.log(props.source);

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
        return (
          <JurisdictionsLayer
            color_code={props.color_code}
            online={networkContext.connected}
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
