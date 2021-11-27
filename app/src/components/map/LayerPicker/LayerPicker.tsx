import React, { useEffect, useContext, useRef } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { DomEvent } from 'leaflet';
import { MapRequestContext } from 'contexts/MapRequestsContext';
/* HelperFiles Parent Layers */
import { sortArray, getChild, sortObject, updateChild } from './SortLayerOrder';
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

export const LayerPicker = React.memo(
  (props: any) => {
    const mapLayersContext = useContext(MapRequestContext);
    const { layersSelected, setLayersSelected } = mapLayersContext;
    const { layersActions, setLayersActions } = mapLayersContext;
    const toolClass = toolStyles();
    const themeContext = useContext(ThemeContext);
    const { themeType } = themeContext;
    const divref = useRef();

    /* Removed for now:
  function getErrorIcon(time: any) {
    return time === 0 ? <ErrorOutlineIcon /> : <CircularProgress />;
  }

  function WithCounter() {
    const [seconds, setSeconds] = React.useState(10);
    React.useEffect(() => {
      if (seconds > 0) {
        setTimeout(() => setSeconds(seconds - 1), 1000);
      }
    });
    return seconds;
  }*/

    useEffect(() => {
      if (divref?.current) {
        DomEvent.disableClickPropagation(divref?.current);
        DomEvent.disableScrollPropagation(divref?.current);
      }
    });

    /**
     * Function used to print opacity as text
     * @param value float to indicate an opacity between 0 and 1
     * @returns string value
     */
    const opacityText = (value: number) => {
      return `${value.toFixed(1)}`;
    };

    const SortableParentLayer = SortableElement(({ parent }) => {
      const onParentLayerAccordionChange = (event: any, expanded: any) => {
        updateParentAction(layersActions, setLayersActions, parent.id, { expanded: expanded });
      };
      const DragHandle = SortableHandle(() => (
        <ListItemIcon>
          {getParentAction(layersActions, parent.id).expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </ListItemIcon>
      ));
      return (
        <ListItem id={parent.id} dense={true} ContainerComponent="div" style={{ width: '100%', maxWidth: 440 }}>
          <Accordion
            id="parent-accordion"
            expanded={getParentAction(layersActions, parent.id).expanded}
            onChange={onParentLayerAccordionChange}
            style={{ width: '100%' }}>
            <Grid
              id="accordion-grid"
              container
              style={{ marginTop: -10, marginBottom: -10 }}
              alignItems="center"
              xs={12}>
              <Grid id="accordion-summary" item xs={10}>
                <AccordionSummary>
                  <Typography variant="subtitle1">{parent.name}</Typography>
                </AccordionSummary>
              </Grid>
              {/* DragHandle */}
              <Grid id="draghandle" item xs={1}>
                <DragHandle />
              </Grid>
            </Grid>
            {parent?.children.map((child: any) => (
              <Grid
                id={child.id}
                container
                style={{ marginBottom: -5, marginTop: -5 }}
                direction="row"
                alignItems="center">
                &emsp;
                <Grid item xs={2} alignContent="center" justifyContent="center">
                  <Checkbox
                    id="child-checkbox"
                    checked={getChild(layersSelected, parent.id, child.id).enabled}
                    name={child.name}
                    onChange={() => {
                      updateChild(layersSelected, setLayersSelected, parent.id, child.id, {
                        enabled: !getChild(layersSelected, parent.id, child.id).enabled
                      });
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption">{child.name}</Typography>
                </Grid>
                {/* Settings Dialog Box */}
                {process.env.REACT_APP_REAL_NODE_ENV === 'development' && (
                  <LayerModeDialog parent={parent} child={child} />
                )}
                {process.env.REACT_APP_REAL_NODE_ENV === 'local' && <LayerModeDialog parent={parent} child={child} />}
                <Grid item xs={1}>
                  <IconButton
                    id="colorpicker-btn"
                    className={toolClass.toolBtn}
                    onClick={() =>
                      toggleDialog(layersActions, setLayersActions, parent, child, { dialog_colorpicker_open: true })
                    }>
                    <ColorLensIcon id="color-lens" style={{ color: child.color_code }} />
                  </IconButton>
                  <Dialog
                    id="layer-settings-dialog"
                    open={getChildAction(layersActions, parent.id, child.id).dialog_colorpicker_open}
                    onClose={() =>
                      toggleDialog(layersActions, setLayersActions, parent, child, {
                        dialog_colorpicker_open: false
                      })
                    }>
                    <DialogTitle>{child.name}</DialogTitle>
                    {/* Opacity */}
                    <DialogContent id="layer-opacity" style={{ width: 300 }}>
                      <Typography id="slider-title" style={{ marginRight: 10 }}>
                        Opacity
                      </Typography>
                      <Slider
                        id="slider-control"
                        defaultValue={child.opacity}
                        onChangeCommitted={(event: any, newOpacity: number | number[]) => {
                          updateChild(layersSelected, setLayersSelected, parent.id, child.id, {
                            opacity: newOpacity
                          });
                        }}
                        getAriaValueText={opacityText}
                        step={0.0001}
                        min={0.0}
                        max={1.0}
                      />
                    </DialogContent>
                    {/* Color Picker */}
                    <DialogContent id="layer-colorpicker" style={{ height: 300 }}>
                      <ColorPicker
                        defaultValue={child.color_code}
                        onChange={(color: any) => {
                          updateChild(layersSelected, setLayersSelected, parent.id, child.id, { color_code: color });
                        }}
                      />
                    </DialogContent>
                    <DialogActions>
                      <DialogCloseBtn
                        parent={parent}
                        child={child}
                        fieldsToUpdate={{ dialog_colorpicker_open: false }}
                      />
                    </DialogActions>
                  </Dialog>
                </Grid>
                {/* <Grid item xs={2} style={{ position: 'relative' }}>
                  {child.loaded === 100 ? <DoneIcon /> : <div>{getErrorIcon(timeLeft)}</div>}
                        </Grid> */}
              </Grid>
            ))}
          </Accordion>
        </ListItem>
      );
    });

    const SortableListContainer = SortableContainer(({ items }: any) => (
      <List>
        {items.map((parent: { id: string; order: number }) => (
          <SortableParentLayer key={parent.id} index={parent.order} parent={parent} />
        ))}
      </List>
    ));

    const onSortEnd = ({ oldIndex, newIndex }: any) => {
      const returnVal = sortObject(layersSelected, oldIndex, newIndex);
      var len = returnVal.length;
      for (var i = 0; i < len; i++) {
        returnVal[i].zIndex = len * 1000;
        len--;
      }
      setLayersSelected(returnVal);
    };

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
                <SortableListContainer
                  items={sortArray(layersSelected)}
                  onSortEnd={onSortEnd}
                  useDragHandle={true}
                  lockAxis="y"
                />
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
                <Accordion id="layer-picker-kml-accordion">
                  <AccordionSummary>KML upload</AccordionSummary>
                  <KMLUpload />
                </Accordion>
              </Popover>
            </>
          )}
        </PopupState>
      </>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.inputGeo !== nextProps.inputGeo) {
      return false;
    }
    return true;
  }
);
