import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TOGGLE_LAYER_PICKER_OPEN, TOGGLE_WMS_LAYER } from 'state/actions';

export const LayerPicker = (props: any) => {
  const layerPickerOpen = useSelector((state: any) => state.Map?.layerPickerOpen);
  const dispatch = useDispatch();
  const WMSLayers = useSelector((state: any) => state?.Map?.simplePickerLayers2);
  // things to map over:
  // wms layers in state
  // kml layers associated to user
  // drawn boundaries
  return (
    <div id="layerPickerElement" className={layerPickerOpen ? 'layerPickerOpen' : 'layerPickerClosed'}>
      <div id="layerPickerToggleOpen" onClick={() => dispatch({ type: TOGGLE_LAYER_PICKER_OPEN })} />
      <div id="layerPickerHeader"></div>
      {layerPickerOpen ? (
        WMSLayers?.map((layer: any) => {
          return (
            <div className="layerPickerLayer">
              <input
                type="checkbox"
                id={layer.title}
                onClick={() => dispatch({ type: TOGGLE_WMS_LAYER, payload: { layer } })}
                name={layer?.title || 'Layer name is null'}
                value={layer?.toggle}
                checked={layer?.toggle}
              />
              <label htmlFor={layer.title}>{layer?.title}</label>
            </div>
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
};
