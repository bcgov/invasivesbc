import {
  Accordion,
  AccordionSummary,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography
} from '@material-ui/core';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext } from 'react';
import { getChildAction } from './LayersActionsHelper/LayersActionsFunctions';
import { updateChild } from './SortLayerOrder';
import { updateChildAction } from './LayersActionsHelper/LayersActionsFunctions';

const getIndex = (childId, layers) => {
  var index = -1;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].child_id === childId) {
      index = i;
      break;
    }
  }
  return index;
};

export const addOrRemoveLayer = (parent, child, layers, setLayers) => {
  var returnLayers = [];
  if (child.enabled) {
    var index = getIndex(child.id, layers);
    if (index > -1) {
      var layersCopy = [...layers];
      layersCopy.splice(index, 1);
      var layersBefore = [...layersCopy.slice(0, index)];
      var layersAfter = [...layersCopy.slice(index)];
      console.log('here', layersBefore, layersAfter);
      setLayers([...layersBefore, ...layersAfter]);
    }
  } else if (!child.enabled) {
    if (child.layer_code) {
      returnLayers = [
        ...layers,
        {
          color_code: child.color_code,
          layer_code: child.layer_code,
          layer_mode: null,
          child_id: child.id,
          opacity: child.opacity,
          parent_order: parent.order,
          parent_id: parent.id
        }
      ];
      setLayers(returnLayers);
    }
    if (child.bcgw_code) {
      returnLayers = [
        ...layers,
        {
          bcgw_code: child.bcgw_code,
          color_code: child.color_code,
          layer_mode: child.layer_mode,
          child_id: child.id,
          opacity: child.opacity,
          parent_order: parent.order,
          parent_id: parent.id
        }
      ];
      setLayers(returnLayers);
    }
  }
};

export const LayersSelector = ({ parent, child }) => {
  const networkContext = useContext(NetworkContext);
  const mapLayersContext = useContext(MapRequestContext);
  const { layersSelected, setLayersSelected } = mapLayersContext;
  const { layersActions, setLayersActions } = mapLayersContext;

  const onServerAccordionChange = (event: any, expanded: any) => {
    updateChildAction(layersActions, setLayersActions, parent.id, child.id, {
      accordion_local_expanded: false,
      accordion_server_expanded: expanded
    });
  };

  const onLocalAccordionChange = (event: any, expanded: any) => {
    updateChildAction(layersActions, setLayersActions, parent.id, child.id, {
      accordion_local_expanded: expanded,
      accordion_server_expanded: false
    });
  };

  return (
    <>
      {/* Server Accordion */}
      {networkContext.connected && (
        <Accordion
          id="server-accordion"
          expanded={getChildAction(layersActions, parent.id, child.id).accordion_server_expanded}
          onChange={onServerAccordionChange}>
          <AccordionSummary id="accordion-summary">
            <Typography>Server</Typography>
          </AccordionSummary>
          {getChildAction(layersActions, parent.id, child.id).accordion_server_expanded && (
            <FormControl id="radio-control">
              <RadioGroup
                id="radio-group"
                defaultValue={child.layer_mode}
                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                  updateChild(layersSelected, setLayersSelected, parent.id, child.id, {
                    layer_mode: event.target.value
                  });
                }}>
                <FormControlLabel value="wms_online" control={<Radio />} label="WMS" />
                <FormControlLabel value="vector_tiles_online" control={<Radio />} label="Vector Tiles" />
              </RadioGroup>
            </FormControl>
          )}
        </Accordion>
      )}

      {/* Local Accordion */}

      <Accordion
        id="local-accordion"
        expanded={getChildAction(layersActions, parent.id, child.id).accordion_local_expanded}
        onChange={onLocalAccordionChange}>
        <AccordionSummary id="accordion-summary">
          <Typography>Local</Typography>
        </AccordionSummary>
        {getChildAction(layersActions, parent.id, child.id).accordion_local_expanded && (
          <FormControl id="radio-control">
            <RadioGroup
              id="radio-group"
              defaultValue={child.layer_mode}
              onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                updateChild(layersSelected, setLayersSelected, parent.id, child.id, { layer_mode: event.target.value });
              }}>
              <FormControlLabel value="wfs_offline" control={<Radio />} label="WFS" />
              <FormControlLabel value="vector_tiles_offline" control={<Radio />} label="Vector Tiles" />
            </RadioGroup>
          </FormControl>
        )}
      </Accordion>
    </>
  );
};
