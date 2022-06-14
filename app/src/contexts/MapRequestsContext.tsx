import * as React from 'react';
import { layersJSON } from 'components/map/LayerPicker/JSON/layers';
import { actions } from 'components/map/LayerPicker/JSON/actions';
import { useSelector } from '../state/utilities/use_selector';
import { selectNetworkConnected } from '../state/reducers/network';

interface IMapExtentLayersContext {
  layers: IParentLayer[];
  setLayers: React.Dispatch<React.SetStateAction<IParentLayer[]>>;
  layersActions: any[];
  setLayersActions: React.Dispatch<React.SetStateAction<any>>;
  mapZoom: number;
  setMapZoom: React.Dispatch<React.SetStateAction<number>>;
  currentRecords: any;
  setCurrentRecords: React.Dispatch<React.SetStateAction<any>>;
  uploadLayersFlag: number;
  setUploadLayersFlag: React.Dispatch<React.SetStateAction<number>>;
}

export interface IParentLayer {
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

export interface IChildLayer {
  dataBCAcceptsGeometry?: boolean;
  simplifyPercentage?: number;
  id?: string;
  name?: string;
  geoJSON?: any;
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
  currentRecords: {},
  setCurrentRecords: () => {},
  uploadLayersFlag: 0,
  setUploadLayersFlag: () => {}
});

export const MapRequestContextProvider: React.FC = (props) => {
  const connected = useSelector(selectNetworkConnected);
  const [mapZoom, setMapZoom] = React.useState<number>(5);
  const [layers, setLayers] = React.useState<IParentLayer[]>(layersJSON(connected, mapZoom));
  const [layersActions, setLayersActions] = React.useState<any[]>(actions());
  const [currentRecords, setCurrentRecords] = React.useState<any>({ activities: [], pois: [] });
  const [uploadLayersFlag, setUploadLayersFlag] = React.useState<number>(0);

  React.useEffect(() => {
    if (layers) {
      setLayers(layersJSON(connected, mapZoom, layers));
    } else {
      setLayers(layersJSON(connected, mapZoom));
    }
  }, [connected, mapZoom]);

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
          setCurrentRecords,
          uploadLayersFlag,
          setUploadLayersFlag
        }),
        [layers, layersActions, mapZoom, setCurrentRecords, currentRecords, uploadLayersFlag, setUploadLayersFlag]
      )}>
      {props.children}
    </MapRequestContext.Provider>
  );
};
