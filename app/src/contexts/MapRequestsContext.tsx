import * as React from 'react';
import data from '../components/map/LayerPicker/GEO_DATA.json';
// export const ThemeContext = React.createContext();

interface IMapExtentLayersContext {
  mapRequest: {
    layer: any;
    extent: any;
  };
  setMapRequest: React.Dispatch<React.SetStateAction<any>>;
  layersSelected: any;
  setLayersSelected: React.Dispatch<React.SetStateAction<any>>;
}

export const MapRequestContext = React.createContext<IMapExtentLayersContext>({
  mapRequest: {
    layer: null,
    extent: null
  },
  setMapRequest: () => {},
  layersSelected: {},
  setLayersSelected: () => {}
});

export const MapRequestContextProvider: React.FC = (props) => {
  const [mapRequest, setMapRequest] = React.useState(null);
  const [layersSelected, setLayersSelected] = React.useState(data);

  return (
    <MapRequestContext.Provider
      value={{
        mapRequest,
        setMapRequest,
        layersSelected,
        setLayersSelected
      }}>
      {props.children}
    </MapRequestContext.Provider>
  );
};
