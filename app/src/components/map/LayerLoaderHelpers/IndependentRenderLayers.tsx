import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext } from 'react';
import { ActivitiesLayer } from './ActivitiesLayer';
import { JurisdictionsLayer } from './JurisdictionsLayer';
import { PoisLayer } from './PoisLayer';

export enum IndependentLayers {
  Activities = 'LEAN_ACTIVITIES',
  POI = 'LEAN_POI',
  Jurisdictions = 'JURISDICTIONS'
}

export const IndependentLayer = (props) => {
  const networkContext = useContext(NetworkContext);

  if (Object.values(IndependentLayers).includes(props.layerName)) {
    switch (props.layerName) {
      case 'LEAN_ACTIVITIES':
        return (
          <ActivitiesLayer color_code={props.color_code} online={networkContext.connected} opacity={props.opacity} />
        );
      case 'LEAN_POI':
        return <PoisLayer online={networkContext.connected} opacity={props.opacity} />;
      case 'JURISDICTIONS':
        return <JurisdictionsLayer online={networkContext.connected} opacity={props.opacity} />;
      default:
        return <></>;
    }
  }
};
