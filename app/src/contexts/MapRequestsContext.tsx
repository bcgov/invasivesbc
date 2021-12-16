import * as React from 'react';
import { layers } from 'components/map/LayerPicker/JSON/layers';
import { actions } from 'components/map/LayerPicker/JSON/actions';
import { NetworkContext } from './NetworkContext';

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
  setLayersActions: () => {}
});

export const MapRequestContextProvider: React.FC = (props) => {
  const networkContext = React.useContext(NetworkContext);
  const [mapRequest, setMapRequest] = React.useState(null);
  const [layersSelected, setLayersSelected] = React.useState<IParentLayer[]>(layers(networkContext.connected));
  const [layersActions, setLayersActions] = React.useState<any[]>(actions());

  return (
    <MapRequestContext.Provider
      value={{
        mapRequest,
        setMapRequest,
        layersSelected,
        setLayersSelected,
        layersActions,
        setLayersActions
      }}>
      {props.children}
    </MapRequestContext.Provider>
  );
};
