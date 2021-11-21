import {
  Accordion,
  AccordionSummary,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography
} from '@material-ui/core';
import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext } from 'react';
import { updateChild } from './LayerPicker';
import { getChild } from './SortLayerOrder';

const getIndex = (child, layers) => {
  for (let i in layers) {
    if (layers[i].bcgw_code === child.bcgw_code) {
      return parseInt(i);
    }
  }
  return -1;
};

export const updateLayer = (fieldsToUpdate, child, layers, setLayers) => {
  if (child.enabled) {
    var index = getIndex(child, layers);
    if (index > -1) {
      var oldLayer = layers[index];
      var layersBefore = [...layers.slice(0, index)];
      var layersAfter = [...layers.slice(index)];
      var updatedLayer = { ...oldLayer, ...fieldsToUpdate };
      layersAfter[0] = updatedLayer;
      setLayers([...layersBefore, ...layersAfter]);
    }
  }
};

export const addOrRemoveLayer = (parent, child, layers, setLayers) => {
  if (child.enabled) {
    var index = getIndex(child, layers);
    if (index > -1) {
      var layersCopy = [...layers];
      layersCopy.splice(index, 1);
      var layersBefore = [...layersCopy.slice(0, index)];
      var layersAfter = [...layersCopy.slice(index)];
      setLayers([...layersBefore, ...layersAfter]);
    }
  } else if (!child.enabled) {
    if (child.layer_mode) {
      setLayers([
        ...layers,
        {
          color_code: child.color_code,
          layer_code: child.layer_code,
          layer_mode: null,
          layer_name: child.name,
          opacity: child.opacity,
          order: parent.order,
          parent_id: parent.id
        }
      ]);
    }
    if (child.bcgw_code) {
      setLayers([
        ...layers,
        {
          bcgw_code: child.bcgw_code,
          color_code: child.color_code,
          layer_mode: child.layer_mode,
          layer_name: child.layer_name,
          opacity: child.opacity,
          order: parent.order,
          parent_id: parent.id
        }
      ]);
    }
  }
  console.log('unsorted', layers);
};

export const LayersSelector = ({ parent, child, objectState, setObjectState, layers, setLayers }) => {
  const networkContext = useContext(NetworkContext);

  const onServerAccordionChange = (event: any, expanded: any) => {
    updateChild(
      parent.id,
      child.id,
      {
        accordion_local_expanded: false,
        accordion_server_expanded: !getChild(objectState, parent.id, child.id).accordion_server_expanded
      },
      { objectState, setObjectState }
    );
  };

  const onLocalAccordionChange = (event: any, expanded: any) => {
    updateChild(
      parent.id,
      child.id,
      {
        accordion_local_expanded: !getChild(objectState, parent.id, child.id).accordion_local_expanded,
        accordion_server_expanded: false
      },
      { objectState, setObjectState }
    );
  };

  return (
    <>
      {/* Server Accordion */}
      {networkContext.connected && (
        <Accordion expanded={child.accordion_server_expanded} onChange={onServerAccordionChange}>
          <AccordionSummary>
            <Typography>Server</Typography>
          </AccordionSummary>
          {child.accordion_server_expanded && (
            <FormControl>
              <RadioGroup
                defaultValue={child.layer_mode}
                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                  updateChild(parent.id, child.id, { layer_mode: event.target.value }, { objectState, setObjectState });
                  updateLayer({ layer_mode: event.target.value }, child, layers, setLayers);
                }}>
                <FormControlLabel value="wms_online" control={<Radio />} label="WMS" />
                <FormControlLabel value="vector_tiles_online" control={<Radio />} label="Vector Tiles" />
                <FormControlLabel value="wfs_online" control={<Radio />} label="WFS" />
              </RadioGroup>
            </FormControl>
          )}
        </Accordion>
      )}

      {/* Local Accordion */}

      <Accordion expanded={child.accordion_local_expanded} onChange={onLocalAccordionChange}>
        <AccordionSummary>
          <Typography>Local</Typography>
        </AccordionSummary>
        {child.accordion_local_expanded && (
          <FormControl>
            <RadioGroup
              defaultValue={child.layer_mode}
              onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                updateChild(parent.id, child.id, { layer_mode: event.target.value }, { objectState, setObjectState });
                updateLayer({ layer_mode: event.target.value }, child, layers, setLayers);
              }}>
              <FormControlLabel value="vector_tiles_offline" control={<Radio />} label="Vector Tiles" />
              <FormControlLabel value="wfs_offline" control={<Radio />} label="WFS" />
            </RadioGroup>
          </FormControl>
        )}
      </Accordion>
    </>
  );
};
