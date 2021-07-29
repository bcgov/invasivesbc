import * as React from 'react';
import data from '../components/map/LayerPicker/GEO_DATA.json';
// export const ThemeContext = React.createContext();

interface IMapLayersContext {
  mapLayers: any[];
  setMapLayers: React.Dispatch<React.SetStateAction<any>>;
}

export const MapLayersContext = React.createContext<IMapLayersContext>({
  mapLayers: [],
  setMapLayers: () => {}
});

export const MapLayersContextProvider: React.FC = (props) => {
  const [mapLayers, setMapLayers] = React.useState(data);

  return <MapLayersContext.Provider value={{ mapLayers, setMapLayers }}>{props.children}</MapLayersContext.Provider>;
};
