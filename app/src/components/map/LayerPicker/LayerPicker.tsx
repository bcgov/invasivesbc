import React, { useEffect, useContext, useRef } from 'react';
import { DomEvent } from 'leaflet';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { assignPaperBGTheme } from '../Tools/Helpers/ToolStyles';
// MUI
import { Button, IconButton, Paper, Popover } from '@material-ui/core';
// MUI Icons
import LayersIcon from '@material-ui/icons/Layers';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { ThemeContext } from 'contexts/themeContext';
import { SortableParent } from './LayerPickerSorting/SortableParent';

export const LayerPicker = () => {
  const mapLayersContext = useContext(MapRequestContext);
  const { layersSelected, setLayersSelected } = mapLayersContext;
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
              style={{ maxHeight: 500 }}
              {...bindPopover(popupState)}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}>
              <SortableParent />
              <Button
                id="layer-picker-save-btn"
                onClick={() => {
                  localStorage.setItem('mySave', JSON.stringify(layersSelected));
                }}>
                Save
              </Button>
              <Button
                id="layer-picker-load-btn"
                onClick={() => {
                  setLayersSelected(JSON.parse(localStorage.getItem('mySave')));
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
