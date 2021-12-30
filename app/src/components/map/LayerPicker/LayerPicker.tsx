import React, { useContext, useEffect, useRef } from 'react';
import { Button, IconButton, Paper, Popover } from '@material-ui/core';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { ThemeContext } from 'contexts/themeContext';
import { DomEvent } from 'leaflet';
import { assignPaperBGTheme } from '../Tools/Helpers/ToolStyles';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { SortableParent } from './Sorting/SortableParent';
import LayersIcon from '@material-ui/icons/Layers';

export const LayerPicker = (props: any) => {
  const mapLayersContext = useContext(MapRequestContext);
  const { layers, setLayers } = mapLayersContext;
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;
  const divref = useRef();

  useEffect(() => {
    if (divref?.current) {
      DomEvent.disableClickPropagation(divref?.current);
      DomEvent.disableScrollPropagation(divref?.current);
    }
  });

  return (
    <>
      <PopupState variant="popover" popupId="layer-picker-popup-state">
        {(popupState) => (
          <>
            <Paper id="layer-picker-paper" style={assignPaperBGTheme(themeType)}>
              <IconButton id="layer-picker-btn" style={{ height: 53, width: 53 }} {...bindTrigger(popupState)}>
                <LayersIcon />
              </IconButton>
            </Paper>
            <Popover
              id="layer-picker-popover"
              style={{ maxHeight: 500, maxWidth: 500 }}
              {...bindPopover(popupState)}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}>
              <SortableParent setGeo={props.setGeo} />
              <Button
                id="layer-picker-save-btn"
                onClick={() => {
                  localStorage.setItem('mySave', JSON.stringify(layers));
                }}>
                Save
              </Button>
              <Button
                id="layer-picker-load-btn"
                onClick={() => {
                  setLayers(JSON.parse(localStorage.getItem('mySave')));
                }}>
                Load
              </Button>
            </Popover>
          </>
        )}
      </PopupState>
    </>
  );
};
