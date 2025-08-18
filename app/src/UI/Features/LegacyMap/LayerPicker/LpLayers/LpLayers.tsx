import { useDispatch, useSelector } from 'utils/use_selector';
import { TOGGLE_CUSTOMIZE_LAYERS } from 'state/actions';
import { Layers, Settings, Visibility, VisibilityOff } from '@mui/icons-material';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import LpLayersOption from './LpLayersOption';
import { nanoid } from '@reduxjs/toolkit';
import { InvasivesMapLayerDefinitionWithState } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';
import './LpLayers.css';
import UserSettings from 'state/actions/userSettings/UserSettings';
import EmptyCollection from '../EmptyCollection/EmptyCollection';

type PropTypes = {
  layers: InvasivesMapLayerDefinitionWithState[];
  setOverlayState: (layer: string) => void;
};

const LpLayers = ({ layers, setOverlayState }: PropTypes) => {
  const handleKmlClick = (layer: Record<string, unknown>) => {
    dispatch(UserSettings.KML.toggle(layer?.id as string));
  };
  const handleCustomClick = (layer: Record<string, unknown>) => {
    dispatch(UserSettings.Boundaries.toggleCustomLayer(layer?.id as string));
  };
  const handleCreateCustom = () => {
    dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
  };
  const KmlTooltip =
    "You can toggle the KML shapes you've uploaded on and off on the map. This feature allows you to customize your view by displaying or hiding your personal geographic data as needed.";
  const WmsTooltip =
    "Toggle the WMS layers imported from the DataBC Catalogue. This feature allows you to control the visibility of additional geographic data, enhancing your map's context and detail.";
  const customTooltip =
    "Turn your custom shapes on and off in the application. This allows you to easily manage the visibility of the shapes you've created, helping you focus on the map elements that matter most to you.";
  const dispatch = useDispatch();
  const KmlLayers = useSelector((state) => state.Map?.serverBoundaries);
  const drawnLayers = useSelector((state) => state.Map?.clientBoundaries);

  return (
    <div id="lp-layers">
      <FeatureGated requires={'MAP_DATABC_LAYERS'}>
        <h3>
          DataBC Layers <TooltipWithIcon tooltipText={WmsTooltip} />
        </h3>
        <div>
          <ul className={'layerList'}>
            {layers
              ?.filter((l) => l.selectionMode === 'layer-picker')
              ?.map((layer) => (
                <li className="lp-layers-item" key={layer.name}>
                  <button
                    data-testid="lp-layers-option-button"
                    onClick={() => {
                      setOverlayState(layer.name);
                    }}
                  >
                    {layer.active ? <Visibility /> : <VisibilityOff />}
                  </button>
                  <p>{layer.displayName}</p>
                </li>
              ))}
          </ul>
        </div>
      </FeatureGated>
      <h3>
        Uploaded KML Layers <TooltipWithIcon tooltipText={KmlTooltip} />
      </h3>

      <div>
        {KmlLayers?.length > 0 ? (
          <ul className="layerList">
            {KmlLayers?.map((layer) => (
              <LpLayersOption key={layer.id ?? nanoid()} onClick={handleKmlClick} layer={layer} />
            ))}
          </ul>
        ) : (
          <EmptyCollection text={'You have not uploaded any KML Layers'} />
        )}
        <div className="control">
          <button className="create-custom-layers" onClick={handleCreateCustom}>
            Edit KML Layers
            <Layers />
            <Settings />
          </button>
        </div>
      </div>
      <div>
        <h3>
          Custom Layers <TooltipWithIcon tooltipText={customTooltip} />
        </h3>
        {drawnLayers?.length > 0 ? (
          <ul className="layersList">
            {drawnLayers.map((layer) => (
              <LpLayersOption key={layer.id ?? nanoid()} onClick={handleCustomClick} layer={layer} />
            ))}
          </ul>
        ) : (
          <EmptyCollection text={'You do not have any custom layers'} />
        )}
        <div className="control">
          <button data-testid="custom-layer-button" className="create-custom-layers" onClick={handleCreateCustom}>
            Edit Custom Layers
            <Layers />
            <Settings />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LpLayers;
