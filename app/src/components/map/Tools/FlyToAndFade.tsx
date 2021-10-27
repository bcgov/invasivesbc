import React, { createContext, useContext } from 'react';
import { useMap } from 'react-leaflet';

export const FlyToAndFadeContext = createContext({});

export const FlyToAndFadeContextProvider: React.FC = (props) => {
  const map = useMap();
  const go = (geometries: Array<any>) => {};

  return <FlyToAndFadeContext.Provider value={{ go }}>{props.children}</FlyToAndFadeContext.Provider>;
};

export function useFlyToAndFadeContext() {
  const context = useContext(FlyToAndFadeContext);

  if (context == null) {
    throw new Error('No context provided: useFlyToAndFadeContext() can only be used in a descendant of <LayerControl>');
  }

  return context;
}
