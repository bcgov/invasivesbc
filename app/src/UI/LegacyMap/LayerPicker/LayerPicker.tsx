import { MOBILE } from 'state/build-time-config';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Switch } from '@mui/material';
import './LayerPicker.css';
import { useState } from 'react';
import LpModules from 'constants/LpModules';
import LayerPickerPathOption from './LayerPickerPathRow';
import { ArrowBackIos } from '@mui/icons-material';
import LpLayers from './LpLayers/LpLayers';
import LpRecordSet from './LpRecordSet/LpRecordSet';
import LpOfflineMaps from './LpOfflineMaps/LpOfflineMaps';
import Accordion from 'UI/Accordion/Accordion';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';

export const LayerPicker = () => {
  const closeLayerPicker = () => {
    setShowLayerPicker(false);
    setPickerPath(LpModules.Init);
  };
  const toggleLayerPickerAccordion = () => dispatch(UserSettings.toggleLayerPickerAccordion());
  const [pickerPath, setPickerPath] = useState<LpModules>(LpModules.Init);
  const [showLayerPicker, setShowLayerPicker] = useState<boolean>(false);
  const isAuth = useSelector((state) => state.Auth.authenticated);
  const accordionMode = useSelector((state) => state.UserSettings.layerPickerIsAccordion);
  const dispatch = useDispatch();

  if (!isAuth) {
    return;
  }
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
        <div className="layer-context">
          {pickerPath !== LpModules.Init ? (
            <>
              <IconButton onClick={() => setPickerPath(LpModules.Init)}>
                <ArrowBackIos />
              </IconButton>
              {pickerPath}
            </>
          ) : (
            <>
              <Switch checked={accordionMode} onChange={toggleLayerPickerAccordion} />
              <span className="small">Expand</span>
            </>
          )}
        </div>
        <IconButton onClick={closeLayerPicker}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className="lp-content">
        {
          {
            [LpModules.Init]: (
              <>
                {accordionMode ? (
                  <>
                    <Accordion icon={'map'} title={LpModules.DataBcLayers}>
                      <LpLayers />
                    </Accordion>
                    <Accordion icon={'manage_search'} title={LpModules.Recordsets}>
                      <LpRecordSet closePicker={closeLayerPicker} />
                    </Accordion>
                    {MOBILE && (
                      <Accordion icon="save" title={LpModules.MapTiles}>
                        <LpOfflineMaps closePicker={closeLayerPicker} />
                      </Accordion>
                    )}
                  </>
                ) : (
                  <ul className="path-ul">
                    <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.DataBcLayers} />
                    <li>
                      <hr />
                    </li>
                    {MOBILE && (
                      <>
                        <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.MapTiles} />
                        <li>
                          <hr />
                        </li>
                      </>
                    )}
                    <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.Recordsets} />
                  </ul>
                )}
              </>
            ),
            [LpModules.DataBcLayers]: <LpLayers />,
            [LpModules.Recordsets]: <LpRecordSet closePicker={closeLayerPicker} />,
            [LpModules.MapTiles]: <LpOfflineMaps closePicker={closeLayerPicker} />
          }[pickerPath]
        }
      </div>
    </div>
  );
};
