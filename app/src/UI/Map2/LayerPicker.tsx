import React from 'react';
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
import { Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export const LayerPicker = (props: any) => {
  const layerPickerOpen = useSelector((state: any) => state.Map?.layerPickerOpen);
  const dispatch = useDispatch();
  const WMSLayers = useSelector((state: any) => state?.Map?.simplePickerLayers2);
  const KMLLayers = useSelector((state: any) => state.Map.serverBoundaries);
  const drawnLayers = useSelector((state: any) => state.Map?.clientBoundaries);
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);
  return (
    <div id="layerPickerElement" className={layerPickerOpen ? 'layerPickerOpen' : 'layerPickerClosed'}>
      <div id="layerPickerToggleOpen" onClick={() => dispatch({ type: TOGGLE_LAYER_PICKER_OPEN })}>
        <>
          {layerPickerOpen ? (
            <CloseIcon className={'MuiLayerPickerIconButton'} />
          ) : (
            <LayersIcon className={'MuiLayerPickerIconButton'} />
          )}
        </>
      </div>
      <div id="layerPickerHeader"></div>
      {layerPickerOpen ? (
        <>
          <div id="WMSLayersHeader" className="layerPickerCategoryHeader">
            DataBC Layers:
          </div>
          {WMSLayers?.map((layer: any) => {
            return (
              <div key={layer.title} className="layerPickerLayer">
                <input
                  type="checkbox"
                  id={layer.title}
                  onChange={() => dispatch({ type: TOGGLE_WMS_LAYER, payload: { layer } })}
                  name={layer?.title || 'Layer name is null'}
                  value={layer?.toggle}
                  checked={layer?.toggle}
                />
                <label htmlFor={layer.title}>{layer?.title}</label>
              </div>
            );
          })}
        </>
      ) : (
        <></>
      )}
      {layerPickerOpen ? (
        <>
          <br />
          <div id="KMLLayersHeader" className="layerPickerCategoryHeader">
            Uploaded Layers:
          </div>
          {KMLLayers?.map((layer: any) => {
            return (
              <div key={layer.title + layer.id} className="layerPickerLayer">
                <input
                  type="checkbox"
                  id={layer.title}
                  onChange={() => dispatch({ type: TOGGLE_KML_LAYER, payload: { layer } })}
                  name={layer?.title || 'Layer name is null'}
                  value={layer?.toggle}
                  checked={layer?.toggle}
                />
                <label htmlFor={layer.title}>{layer?.title}</label>
              </div>
            );
          })}
        </>
      ) : (
        <></>
      )}
      {layerPickerOpen ? (
        <>
          <br />
          <div id="DrawnBoundariesHeader" className="layerPickerCategoryHeader">
            Drawn Layers:
          </div>
          {drawnLayers?.map((layer: any) => {
            return (
              <div key={layer.title + layer.id} className="layerPickerLayer">
                <input
                  type="checkbox"
                  id={layer.title}
                  onChange={() => dispatch({ type: TOGGLE_DRAWN_LAYER, payload: { layer } })}
                  name={layer?.title || 'Layer name is null'}
                  value={layer?.toggle}
                  checked={layer?.toggle}
                />
                <label htmlFor={layer.title}>{layer?.title}</label>
              </div>
            );
          })}
        </>
      ) : (
        <></>
      )}
      {layerPickerOpen && isAuth ? (
        <Button
          className={'layerpickercustomizeMenu'}
          variant="outlined"
          onClick={() => {
            dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
          }}
        >
          Add custom
          <LayersIcon sx={{ width: '15px' }} />
          <SettingsIcon sx={{ width: '15px' }} />
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};
