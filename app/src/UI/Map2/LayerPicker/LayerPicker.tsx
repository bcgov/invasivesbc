import { useDispatch, useSelector } from 'react-redux';
import {
  TOGGLE_CUSTOMIZE_LAYERS,
  TOGGLE_DRAWN_LAYER,
  TOGGLE_KML_LAYER,
  TOGGLE_LAYER_PICKER_OPEN,
  TOGGLE_WMS_LAYER
} from 'state/actions';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import './LayerPicker.css';
import { useState } from 'react';
import LpModules from 'constants/LpModules';
import LayerPickerPathOption from './LayerPickerPathRow';
import { ArrowBackIos } from '@mui/icons-material';
import LpLayers from './LpLayers/LpLayers';

export const LayerPicker = () => {
  const closeLayerPicker = () => {
    setShowLayerPicker(false);
    setPickerPath(LpModules.Init);
  };
  const handlePathChange = (val: LpModules) => setPickerPath(val);
  const [pickerPath, setPickerPath] = useState<LpModules>(LpModules.Init);
  const [showAsAccordion, setShowAsAccordion] = useState<boolean>(false);
  const [showLayerPicker, setShowLayerPicker] = useState<boolean>(false);
  const dispatch = useDispatch();
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);
  /**
   * bg: 239, 238,245
   * button: white
   * focus: 188, 198, 205
   * header: 245, 256, 246
   */
  if (!showLayerPicker) {
    return (
      <button id="layer-picker-closed-icon" className="layer-picker-pos" onClick={() => setShowLayerPicker(true)}>
        <LayersIcon />
      </button>
    );
  }
  return (
    <div id="layer-picker-container" className="layer-picker-pos">
      <div>
        {pickerPath !== LpModules.Init && (
          <div className="layer-context">
            <IconButton onClick={() => setPickerPath(LpModules.Init)}>
              <ArrowBackIos />
            </IconButton>
            {pickerPath}
          </div>
        )}
        <IconButton onClick={closeLayerPicker}>
          <CloseIcon />
        </IconButton>
      </div>
      {
        {
          [LpModules.Init]: (
            <>
              {showAsAccordion ? (
                <></>
              ) : (
                <ul className="path-ul">
                  <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.DataBcLayers} />
                  <li>
                    <hr />
                  </li>
                  <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.MapTiles} />
                  <li>
                    <hr />
                  </li>
                  <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.Recordsets} />
                </ul>
              )}
            </>
          ),
          [LpModules.DataBcLayers]: <LpLayers />,
          [LpModules.Recordsets]: <></>,
          [LpModules.MapTiles]: <></>
        }[pickerPath]
      }
    </div>

    //   <div id="layerPickerElement" className={layerPickerOpen ? 'layerPickerOpen' : 'layerPickerClosed'}>
    //     <div id="layerPickerToggleOpen" onClick={() => dispatch({ type: TOGGLE_LAYER_PICKER_OPEN })}>
    //       <>
    //         {layerPickerOpen ? (
    //           <CloseIcon className={'MuiLayerPickerIconButton'} />
    //         ) : (
    //           <LayersIcon className={'MuiLayerPickerIconButton'} />
    //         )}
    //       </>
    //     </div>
    //     <div id="layerPickerHeader"></div>
    //     {layerPickerOpen ? (
    //       <>
    //         <div id="WMSLayersHeader" className="layerPickerCategoryHeader">
    //           DataBC Layers:
    //         </div>
    //         <ul className="layerPickerList">
    //           {WMSLayers?.map((layer: any) => {
    //             return (
    //               <li key={layer.title} className="layerPickerLayer">
    //                 <input
    //                   type="checkbox"
    //                   id={layer.title}
    //                   onChange={() => dispatch({ type: TOGGLE_WMS_LAYER, payload: { layer } })}
    //                   name={layer?.title || 'Layer name is null'}
    //                   value={layer?.toggle}
    //                   checked={layer?.toggle}
    //                 />
    //                 <label htmlFor={layer.title}>{layer?.title}</label>
    //               </li>
    //             );
    //           })}
    //         </ul>
    //       </>
    //     ) : (
    //       <></>
    //     )}
    //     {layerPickerOpen ? (
    //       <>
    //         <div id="KMLLayersHeader" className="layerPickerCategoryHeader">
    //           Uploaded Layers:
    //         </div>
    //         <ul className="layerPickerList">
    //           {KMLLayers?.map((layer: any) => {
    //             return (
    //               <li key={layer.title + layer.id} className="layerPickerLayer">
    //                 <input
    //                   type="checkbox"
    //                   id={layer.title}
    //                   onChange={() => dispatch({ type: TOGGLE_KML_LAYER, payload: { layer } })}
    //                   name={layer?.title || 'Layer name is null'}
    //                   value={layer?.toggle}
    //                   checked={layer?.toggle}
    //                 />
    //                 <label htmlFor={layer.title}>{layer?.title}</label>
    //               </li>
    //             );
    //           })}
    //         </ul>
    //       </>
    //     ) : (
    //       <></>
    //     )}
    //     {layerPickerOpen ? (
    //       <>
    //         <div id="DrawnBoundariesHeader" className="layerPickerCategoryHeader">
    //           Drawn Layers:
    //         </div>
    //         <ul className="layerPickerList">
    //           {drawnLayers?.map((layer: any) => {
    //             return (
    //               <li key={layer.title + layer.id} className="layerPickerLayer">
    //                 <input
    //                   type="checkbox"
    //                   id={layer.title}
    //                   onChange={() => dispatch({ type: TOGGLE_DRAWN_LAYER, payload: { layer } })}
    //                   name={layer?.title || 'Layer name is null'}
    //                   value={layer?.toggle}
    //                   checked={layer?.toggle}
    //                 />
    //                 <label htmlFor={layer.title}>{layer?.title}</label>
    //               </li>
    //             );
    //           })}
    //         </ul>
    //       </>
    //     ) : (
    //       <></>
    //     )}
    //     {layerPickerOpen && isAuth ? (
    //       <Button
    //         className={'layerpickercustomizeMenu'}
    //         variant="outlined"
    //         onClick={() => {
    //           dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
    //         }}
    //       >
    //         Add custom
    //         <LayersIcon sx={{ width: '15px' }} />
    //         <SettingsIcon sx={{ width: '15px' }} />
    //       </Button>
    //     ) : (
    //       <></>
    //     )}
    //   </div>
  );
};
