import * as React from 'react';
import { layers } from 'components/map/LayerPicker/JSON/layers';
import { actions } from 'components/map/LayerPicker/JSON/actions';
import { NetworkContext } from './NetworkContext';
import { useMap, useMapEvent } from 'react-leaflet';

interface IMapExtentLayersContext {
  mapRequest: {
    layer: any;
    extent: any;
  };
  setMapRequest: React.Dispatch<React.SetStateAction<any>>;
  layersSelected: IParentLayer[];
  setLayersSelected: React.Dispatch<React.SetStateAction<IParentLayer[]>>;
  layersActions: any[];
  setLayersActions: React.Dispatch<React.SetStateAction<any>>;
  mapZoom: number;
  setMapZoom: React.Dispatch<React.SetStateAction<number>>;
}

interface IParentLayer {
  id?: string;
  name?: string;
  order?: number;
  zIndex?: number;
  loaded?: number;
  checked?: boolean;
  expanded?: boolean;
  enabled?: boolean;
  children?: IChildLayer[];
}

interface IChildLayer {
  dataBCAcceptsGeometry?: boolean;
  simplifyPercentage?: number;
  id?: string;
  name?: string;
  source?: string;
  layer_mode?: string;
  layer_code?: string;
  color_code?: string;
  order?: number;
  bcgw_code?: string;
  opacity?: number;
  zIndex?: number;
  loaded?: number;
  enabled?: boolean;
  dialog_layerselector_open?: boolean;
  dialog_colorpicker_open?: boolean;
  accordion_server_expanded?: boolean;
  accordion_local_expanded?: boolean;
}

export const MapRequestContext = React.createContext<IMapExtentLayersContext>({
  mapRequest: {
    layer: null,
    extent: null
  },
  setMapRequest: () => {},
  layersSelected: [],
  setLayersSelected: () => {},
  layersActions: [],
  setLayersActions: () => {},
  mapZoom: 5,
  setMapZoom: () => {}
});

export const MapRequestContextProvider: React.FC = (props) => {
  const networkContext = React.useContext(NetworkContext);
  const [mapRequest, setMapRequest] = React.useState(null);
  const [mapZoom, setMapZoom] = React.useState<number>(5);
  const [layersSelected, setLayersSelected] = React.useState<IParentLayer[]>(layers(networkContext.connected, mapZoom));
  const [layersActions, setLayersActions] = React.useState<any[]>(actions());

  const mapObj = useMap();
  useMapEvent('zoomend' as any, () => {
    setMapZoom(mapObj.getZoom());
  });

  React.useEffect(() => {
    if (layersSelected) {
      setLayersSelected(layers(networkContext.connected, mapZoom, layersSelected));
    } else {
      setLayersSelected(layers(networkContext.connected, mapZoom));
    }
  }, [networkContext, mapZoom]);

  return (
    <MapRequestContext.Provider
      value={{
        mapRequest,
        setMapRequest,
        layersSelected,
        setLayersSelected,
        layersActions,
        setLayersActions,
        mapZoom,
        setMapZoom
      }}>
      {props.children}
    </MapRequestContext.Provider>
  );
};
