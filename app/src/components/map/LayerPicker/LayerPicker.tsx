import React, { useEffect, useContext, useRef } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { DomEvent } from 'leaflet';
import { MapRequestContext } from 'contexts/MapRequestsContext';
/* HelperFiles Parent Layers */
import { sortArray, getChild, sortObject, updateChild } from './LayerPickerSorting/SortLayerOrder';
/* Helper Files Parent Actions */
import {
  DialogCloseBtn,
  getChildAction,
  toggleDialog,
  updateParentAction
} from './LayersActionsHelper/LayersActionsFunctions';
import { getParentAction } from 'components/map/LayerPicker/LayersActionsHelper/LayersActionsFunctions';
import { assignPaperBGTheme, toolStyles } from '../Tools/Helpers/ToolStyles';
// MUI
import {
  Accordion,
  AccordionSummary,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Paper,
  Popover,
  Slider,
  Typography
} from '@material-ui/core';
import ColorLensIcon from '@material-ui/icons/ColorLens';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// MUI Icons
import LayersIcon from '@material-ui/icons/Layers';
import KMLUpload from 'components/map-buddy-components/KMLUpload';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { LayerModeDialog } from './LayerModeSelector';
import { ThemeContext } from 'contexts/themeContext';
import ColorPicker from 'material-ui-color-picker';
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
              {/*<SortableListContainer
                  items={sortArray(layersSelected)}
                  onSortEnd={onSortEnd}
                  useDragHandle={true}
                  lockAxis="y"
                />*/}
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
