import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Switch } from '@mui/material';
import { useState } from 'react';
import LpModules from 'constants/LpModules';
import LayerPickerPathOption from './LayerPickerPathRow';
import { ArrowBackIos, Luggage, Save } from '@mui/icons-material';
import LpLayers from './LpLayers/LpLayers';
import LpRecordSet from './LpRecordSet/LpRecordSet';
import LpOfflineMaps from './LpOfflineMaps/LpOfflineMaps';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';

import MapIcon from '@mui/icons-material/Map';

import './LayerPicker.css';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { InvasivesMapLayerDefinitionWithState } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';
import LpPlanMyTrip from './LpPlanMyTrip/LpPlanMyTrip';

type PropTypes = {
  layers: InvasivesMapLayerDefinitionWithState[];
  setOverlayState: (layer: string) => void;
};

export const LayerPicker = ({ layers, setOverlayState }: PropTypes) => {
  const closeLayerPicker = () => {
    setShowLayerPicker(false);
    setPickerPath(LpModules.Init);
  };
  const toggleLayerPickerAccordion = () => dispatch(UserSettings.toggleLayerPickerAccordion());
  const [pickerPath, setPickerPath] = useState<LpModules>(LpModules.Init);
  const [showLayerPicker, setShowLayerPicker] = useState<boolean>(false);
  const accordionMode = useSelector((state) => state.UserSettings.layerPickerIsAccordion);
  const dispatch = useDispatch();

  if (!showLayerPicker) {
    return (
      <button
        data-testid="lp-open"
        id="layer-picker-closed-icon"
        className="layer-picker-pos"
        onClick={() => setShowLayerPicker(true)}
      >
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
        <IconButton data-testid="lp-close" onClick={closeLayerPicker}>
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
                    <Accordion icon={<MapIcon />} title={LpModules.DataBcLayers}>
                      <LpLayers layers={layers} setOverlayState={setOverlayState} />
                    </Accordion>
                    <Accordion icon={<ManageSearchIcon />} title={LpModules.Recordsets}>
                      <LpRecordSet closePicker={closeLayerPicker} />
                    </Accordion>
                    <FeatureGated requires={'CACHE_TILES'}>
                      <Accordion icon={<Save />} title={LpModules.MapTiles}>
                        <LpOfflineMaps
                          layers={layers}
                          setOverlayState={setOverlayState}
                          closePicker={closeLayerPicker}
                        />
                      </Accordion>
                    </FeatureGated>
                    <FeatureGated requires={'PLAN_MY_TRIP'}>
                      <Accordion icon={<Luggage />} title={LpModules.PlanMyTrip}>
                        <div>Plan My Trip</div>
                      </Accordion>
                    </FeatureGated>
                  </>
                ) : (
                  <ul className="path-ul">
                    <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.DataBcLayers} />
                    <FeatureGated requires={'CACHE_TILES'}>
                      <hr />
                      <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.MapTiles} />
                    </FeatureGated>
                    <hr />
                    <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.Recordsets} />
                    <FeatureGated requires={'PLAN_MY_TRIP'}>
                      <hr />
                      <LayerPickerPathOption clickHandler={setPickerPath} pathVal={LpModules.PlanMyTrip} />
                    </FeatureGated>
                  </ul>
                )}
              </>
            ),
            [LpModules.DataBcLayers]: <LpLayers layers={layers} setOverlayState={setOverlayState} />,
            [LpModules.Recordsets]: <LpRecordSet closePicker={closeLayerPicker} />,
            [LpModules.MapTiles]: (
              <LpOfflineMaps layers={layers} setOverlayState={setOverlayState} closePicker={closeLayerPicker} />
            ),
            [LpModules.PlanMyTrip]: <LpPlanMyTrip />
          }[pickerPath]
        }
      </div>
    </div>
  );
};
