import { useDispatch, useSelector } from 'utils/use_selector';
import './LpLayers.css';
import { TOGGLE_CUSTOMIZE_LAYERS, TOGGLE_KML_LAYER, TOGGLE_WMS_LAYER } from 'state/actions';
import { Layers, LayersOutlined, Settings, SettingsOutlined } from '@mui/icons-material';
import TooltipWithIcon from 'UI/TooltipWithIcon/TooltipWithIcon';
import LayerPickerItem from '../LayerPickerOptionRow';
import { nanoid } from '@reduxjs/toolkit';

type PropTypes = {};

const LpLayers = ({}: PropTypes) => {
  const handleWMSClick = (layer) => {
    dispatch({ type: TOGGLE_WMS_LAYER, payload: { layer } });
  };
  const handleCreateCustom = () => {
    dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
  };
  const dispatch = useDispatch();
  const WMSLayers = useSelector((state) => state.Map?.simplePickerLayers2);
  const KMLLayers = useSelector((state) => state.Map?.serverBoundaries);
  const drawnLayers = useSelector((state) => state.Map?.clientBoundaries);

  return (
    <div id="lp-layers">
      <h3>
        DataBC Layers <TooltipWithIcon tooltipText="Hello World" />
      </h3>
      <div>
        <ul className="layerList">
          {WMSLayers?.map((layer: any) => (
            <LayerPickerItem key={layer.id ?? nanoid} onClick={handleWMSClick} layer={layer} />
            //   <li key={layer.title} className="layerPickerLayer">
            //     <input
            //       type="checkbox"
            //       id={layer.title}
            //       onChange={() => dispatch({ type: TOGGLE_WMS_LAYER, payload: { layer } })}
            //       name={layer?.title || 'Layer name is null'}
            //       value={layer?.toggle}
            //       checked={layer?.toggle}
            //     />
            //     <label htmlFor={layer.title}>{layer?.title}</label>
            //   </li>
            // );
          ))}
        </ul>
      </div>
      <h3>
        Uploaded Layers <TooltipWithIcon tooltipText="Hello World" />
      </h3>
      <div>
        <ul className="layerList">
          {KMLLayers?.map((layer: any) => {
            return (
              <li key={layer.title + layer.id} className="layerPickerLayer">
                <input
                  type="checkbox"
                  id={layer.title}
                  onChange={() => dispatch({ type: TOGGLE_KML_LAYER, payload: { layer } })}
                  name={layer?.title || 'Layer name is null'}
                  value={layer?.toggle}
                  checked={layer?.toggle}
                />
                <label htmlFor={layer.title}>{layer?.title}</label>
              </li>
            );
          })}
        </ul>
      </div>
      <h3>
        DrawnLayers <TooltipWithIcon tooltipText="Hello World" />
      </h3>
      <div>
        <ul className="layerList"></ul>
        <button onClick={handleCreateCustom}>
          Add Custom
          <Layers />
          <Settings />
        </button>
      </div>
    </div>
  );
};

export default LpLayers;
