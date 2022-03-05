import * as React from 'react';
import { layersJSON } from 'components/map/LayerPicker/JSON/layers';
import { actions } from 'components/map/LayerPicker/JSON/actions';
import { NetworkContext } from './NetworkContext';

interface IMapExtentLayersContext {
  layers: IParentLayer[];
  setLayers: React.Dispatch<React.SetStateAction<IParentLayer[]>>;
  layersActions: any[];
  setLayersActions: React.Dispatch<React.SetStateAction<any>>;
  mapZoom: number;
  setMapZoom: React.Dispatch<React.SetStateAction<number>>;
  currentRecords: any[];
  setCurrentRecords: React.Dispatch<React.SetStateAction<any>>;
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
  activity_subtype?: string;
  poi_type?: string;
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
  layers: [],
  setLayers: () => {},
  layersActions: [],
  setLayersActions: () => {},
  mapZoom: 5,
  setMapZoom: () => {},
  currentRecords: [],
  setCurrentRecords: () => {}
});

export const MapRequestContextProvider: React.FC = (props) => {
  const networkContext = React.useContext(NetworkContext);
  const [mapZoom, setMapZoom] = React.useState<number>(5);
  const [layers, setLayers] = React.useState<IParentLayer[]>(layersJSON(networkContext.connected, mapZoom));
  const [layersActions, setLayersActions] = React.useState<any[]>(actions());
  const [currentRecords, setCurrentRecords] = React.useState<any>([]);

  React.useEffect(() => {
    if (layers) {
      setLayers(layersJSON(networkContext.connected, mapZoom, layers));
    } else {
      setLayers(layersJSON(networkContext.connected, mapZoom));
    }
  }, [networkContext, mapZoom]);

  return (
    <MapRequestContext.Provider
      value={React.useMemo(
        () => ({
          layers,
          setLayers,
          layersActions,
          setLayersActions,
          mapZoom,
          setMapZoom,
          currentRecords,
          setCurrentRecords
        }),
        [layers, layersActions, mapZoom, currentRecords]
      )}>
      {props.children}
    </MapRequestContext.Provider>
  );
};
