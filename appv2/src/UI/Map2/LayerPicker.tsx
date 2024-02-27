import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TOGGLE_KML_LAYER, TOGGLE_LAYER_PICKER_OPEN, TOGGLE_WMS_LAYER } from 'state/actions';

export const LayerPicker = (props: any) => {
  const layerPickerOpen = useSelector((state: any) => state.Map?.layerPickerOpen);
  const dispatch = useDispatch();
  const WMSLayers = useSelector((state: any) => state?.Map?.simplePickerLayers2);
  const KMLLayers = useSelector((state: any) => state.Map.serverBoundaries);
  // things to map over:
  // wms layers in state
  // kml layers associated to user
  // drawn boundaries
  return (
    <div id="layerPickerElement" className={layerPickerOpen ? 'layerPickerOpen' : 'layerPickerClosed'}>
      <div id="layerPickerToggleOpen" onClick={() => dispatch({ type: TOGGLE_LAYER_PICKER_OPEN })} />
      <div id="layerPickerHeader"></div>
      {layerPickerOpen ? (
        <>
          <div id="WMSLayersHeader">DataBC Layers:</div>
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
          <div id="KMLLayersHeader">Uploaded Layers:</div>
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
    </div>
  );
};
