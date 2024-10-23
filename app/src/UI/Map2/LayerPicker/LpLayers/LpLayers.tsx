import { useDispatch, useSelector } from 'utils/use_selector';
import './LpLayers.css';
import { TOGGLE_CUSTOMIZE_LAYERS, TOGGLE_DRAWN_LAYER, TOGGLE_KML_LAYER, TOGGLE_WMS_LAYER } from 'state/actions';
import { Layers, Settings } from '@mui/icons-material';
import TooltipWithIcon from 'UI/TooltipWithIcon/TooltipWithIcon';
import LayerPickerItem from '../LayerPickerOptionRow';
import { nanoid } from '@reduxjs/toolkit';

type PropTypes = {};

type EmptyListProps = {
  text: string;
};
const EmptyCollection = ({ text }: EmptyListProps) => (
  <div className="lp-layers-empty-collection">
    <p>{text}</p>
  </div>
);
const LpLayers = ({}: PropTypes) => {
  const handleWmsClick = (layer) => {
    dispatch({ type: TOGGLE_WMS_LAYER, payload: { layer } });
  };
  const handleKmlClick = (layer: Record<string, any>) => {
    dispatch({ type: TOGGLE_KML_LAYER, payload: { layer } });
  };
  const handleCustomClick = (layer: Record<string, any>) => {
    dispatch({ type: TOGGLE_DRAWN_LAYER, payload: { layer } });
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
  const WmsLayers = useSelector((state) => state.Map?.simplePickerLayers2);
  const KmlLayers = useSelector((state) => state.Map?.serverBoundaries);
  const drawnLayers = useSelector((state) => state.Map?.clientBoundaries);
  return (
    <div id="lp-layers">
      <h3>
        DataBC Layers <TooltipWithIcon tooltipText={WmsTooltip} />
      </h3>
      <div>
        {WmsLayers?.length > 0 ? (
          <ul className="layerList">
            {WmsLayers.map((layer, index) => (
              <LayerPickerItem
                key={layer.id ?? nanoid}
                onClick={handleWmsClick}
                layer={layer}
                lastEntry={index === WmsLayers.length - 1}
              />
            ))}
          </ul>
        ) : (
          <EmptyCollection text={'There are no DataBC layers available.'} />
        )}
      </div>
      <h3>
        Uploaded KML Layers <TooltipWithIcon tooltipText={KmlTooltip} />
      </h3>
      <div>
        {KmlLayers?.length > 0 ? (
          <ul className="layerList">
            {KmlLayers?.map((layer, index) => (
              <LayerPickerItem
                key={layer.id ?? nanoid}
                onClick={handleKmlClick}
                layer={layer}
                lastEntry={index === KmlLayers.length - 1}
              />
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
            {drawnLayers.map((layer, index) => (
              <LayerPickerItem
                key={layer.id ?? nanoid}
                onClick={handleCustomClick}
                layer={layer}
                lastEntry={index === drawnLayers.length - 1}
              />
            ))}
          </ul>
        ) : (
          <EmptyCollection text={'You do not have any custom layers'} />
        )}
        <div className="control">
          <button className="create-custom-layers" onClick={handleCreateCustom}>
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
