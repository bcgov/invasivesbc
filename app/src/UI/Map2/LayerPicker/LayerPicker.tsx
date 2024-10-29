import { useSelector } from 'react-redux';
import { MOBILE } from 'state/build-time-config';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Switch } from '@mui/material';
import './LayerPicker.css';
import { useState } from 'react';
import LpModules from 'constants/LpModules';
import LayerPickerPathOption from './LayerPickerPathRow';
import { ArrowBackIos, Expand, Menu } from '@mui/icons-material';
import LpLayers from './LpLayers/LpLayers';
import LpRecordSet from './LpRecordSet/LpRecordSet';
import LpOfflineMaps from './LpOfflineMaps/LpOfflineMaps';
import Accordion from 'UI/Accordion/Accordion';

export const LayerPicker = () => {
  const closeLayerPicker = () => {
    setShowLayerPicker(false);
    setPickerPath(LpModules.Init);
  };
  const [pickerPath, setPickerPath] = useState<LpModules>(LpModules.Init);
  const [showAsAccordion, setShowAsAccordion] = useState<boolean>(false);
  const [showLayerPicker, setShowLayerPicker] = useState<boolean>(false);
  const isAuth = useSelector((state: any) => state.Auth?.authenticated);

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
              <Menu />
              <Switch checked={showAsAccordion} onChange={() => setShowAsAccordion((prev) => !prev)} />
              <Expand />
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
                {showAsAccordion ? (
                  <>
                    <Accordion icon={'map'} title={LpModules.DataBcLayers}>
                      <LpLayers />
                    </Accordion>
                    <Accordion icon={'save'} title={LpModules.Recordsets}>
                      <LpRecordSet closePicker={closeLayerPicker} />
                    </Accordion>
                    {MOBILE && (
                      <Accordion icon="manage_search" title={LpModules.MapTiles}>
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
