import React, { useState, useEffect, useContext, useRef } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { LayersControlProvider } from './layerControlContext';
import { DataBCLayer, LayerMode } from '../LayerLoaderHelpers/DataBCRenderLayer';
import { DomEvent } from 'leaflet';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { Capacitor } from '@capacitor/core';
/* HelperFiles */
import {
  sortArray,
  getObjectsBeforeIndex,
  getObjectsAfterIndex,
  getChildObjBeforeIndex,
  getChildObjAfterIndex,
  getParentIndex,
  getChildIndex,
  getParent,
  getChild,
  sortObject
} from './SortLayerOrder';
import { toolStyles } from '../Tools/Helpers/ToolBtnStyles';
// MUI
import {
  Checkbox,
  Grid,
  ListItemIcon,
  ListItem,
  List,
  CircularProgress,
  AccordionSummary,
  Accordion,
  makeStyles,
  IconButton,
  Paper,
  Slider,
  Typography,
  FormControl,
  Popover,
  Button,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  NativeSelect,
  Tooltip
} from '@material-ui/core';
import ColorPicker from 'material-ui-color-picker';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
// MUI Icons
import LayersIcon from '@material-ui/icons/Layers';
import ColorLens from '@material-ui/icons/ColorLens';
import SettingsIcon from '@material-ui/icons/Settings';
import DoneIcon from '@material-ui/icons/Done';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '360px',
    height: '360px',
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 1500,
    borderRadius: '4px',
    right: 60,
    top: 20,
    ['@media (max-width:800px)']: {
      top: 100
    }
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  accordion: {
    width: '100%'
  },
  div: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinnerGridItem: {
    width: '50px'
  },
  gridContainer: {
    position: 'relative'
  },
  tooltipWidth: {
    maxWidth: 500
  }
}));

const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right'
};

export function LayerPicker(props: any, { position }) {
  const classes = useStyles();
  const toolClass = toolStyles();
  const mapLayersContext = useContext(MapRequestContext);
  const timeLeft = WithCounter();
  const { layersSelected, setLayersSelected } = mapLayersContext;
  const [objectState, setObjectState] = useState(layersSelected);
  const [layers, setLayers] = useState([]);
  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
  const divref = useRef();

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
  }

  useEffect(() => {
    if (divref?.current) {
      DomEvent.disableClickPropagation(divref?.current);
      DomEvent.disableScrollPropagation(divref?.current);
    }
  });

  const opacityText = (value: number) => {
    return `${value.toFixed(1)}`;
  };

  const updateLayer = (child, fieldsToUpdate: Object) => {
    var arrLen = layers.length;
    if (arrLen > 0) {
      var temp;
      for (let i in layers) {
        if (layers[i].BCGWcode === child.BCGWcode) {
          temp = i;
        }
      }
      const layersBefore = [...layers.slice(0, temp)];
      const layersAfter = [...layers.slice(temp)];
      const oldLayer = layers[temp];
      const updatedLayer = { ...oldLayer, ...fieldsToUpdate };
      layersAfter[0] = updatedLayer;
      setLayers([...layersBefore, ...layersAfter] as any);
    }
  };

  const updateParent = (parentType: string, fieldsToUpdate: Object) => {
    let pIndex = getParentIndex(objectState, parentType);
    let parentsBefore: Object[] = getObjectsBeforeIndex(objectState, pIndex);
    let parentsAfter: Object[] = getObjectsAfterIndex(objectState, pIndex);
    const oldParent = getParent(objectState, parentType);
    const updatedParent = { ...oldParent, ...fieldsToUpdate };
    setObjectState([...parentsBefore, updatedParent, ...parentsAfter] as any);
  };

  const updateChild = (parentType: string, childType: string, fieldsToUpdate: Object) => {
    // sort parents, get index of parent
    let pIndex = getParentIndex(objectState, parentType);
    // sort child of specific parent, get index of child
    let cIndex = getChildIndex(objectState, parentType, childType);
    // get old child and overwrite fields with fields in fieldsToUpdate
    const oldChild = getChild(objectState, parentType, childType);
    const updatedChild = { ...oldChild, ...fieldsToUpdate };
    // break up slicing into chunks:
    let parentsBefore = getObjectsBeforeIndex(objectState, pIndex);
    let parentsAfter = getObjectsAfterIndex(objectState, pIndex);
    //spread to avoid reference issue when copying
    const oldParent = getParent(objectState, parentType);

    const childrenBefore = getChildObjBeforeIndex(objectState, pIndex, cIndex);
    const childrenAfter = getChildObjAfterIndex(objectState, pIndex, cIndex);

    const newParent = {
      ...oldParent,
      children: [...childrenBefore, updatedChild, ...childrenAfter]
    };

    setObjectState([...parentsBefore, newParent, ...parentsAfter] as any);
  };

  const updateRenderedLayers = (parent, child) => {
    if (child.enabled) {
      var index;
      for (let i in layers) {
        if (layers[i].BCGWcode === child.BCGWcode) {
          index = i;
        }
      }
      var tempCopy = [...layers];
      tempCopy.splice(index, 1);
      var layersBefore = [...tempCopy.slice(0, index)];
      var layersAfter = [...tempCopy.slice(index)];
      setLayers([...layersBefore, ...layersAfter]);
    } else if (!child.enabled) {
      setLayers([...layers, { BCGWcode: child.BCGWcode, opacity: child.opacity, type: child.type }]);
    }
    updateChild(parent.id, child.id, {
      enabled: !getChild(objectState, parent.id, child.id).enabled
    });
  };

  const updateChildAndLayer = (parent, child, fieldsToUpdate: Object) => {
    if (child.enabled) {
      updateLayer(child, fieldsToUpdate);
    }
    updateChild(parent.id, child.id, fieldsToUpdate);
  };

  const toggleChildDialog = (parent, child) => {
    updateChild(parent.id, child.id, {
      dialogOpen: !getChild(objectState, parent.id, child.id).dialogOpen
    });
  };

  const toggleColorPickerDialog = (parent) => {
    updateParent(parent.id, {
      colorpickerOpen: !getParent(objectState, parent.id).colorpickerOpen
    });
  };

  const toggleInfoDialog = (parent) => {
    updateParent(parent.id, {
      infoDialogOpen: !getParent(objectState, parent.id).infoDialogOpen
    });
  };

  const DragHandle = SortableHandle(() => (
    <ListItemIcon>
      <DragHandleIcon />
    </ListItemIcon>
  ));
  //update context on ObjectState change
  useEffect(() => {
    setLayersSelected(layers);
  }, [layers]);

  const SortableParentLayer = SortableElement(({ parent }) => {
    const onParentLayerAccordionChange = (event: any, expanded: any) => {
      updateParent(parent.id, { expanded: expanded });
    };
    return (
      <ListItem ContainerComponent="div" style={{ width: '100%', maxWidth: 360 }}>
        <Grid container spacing={1}>
          <Accordion expanded={parent.expanded} onChange={onParentLayerAccordionChange} className={classes.accordion}>
            <Grid container xs={12} justifyContent="space-between" alignItems="center">
              <Grid item xs={1}>
                <Tooltip
                  disableFocusListener
                  classes={{ tooltip: classes.tooltipWidth }}
                  title={JSON.stringify(parent)}>
                  <IconButton onClick={() => toggleInfoDialog(parent)}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item xs={7}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.heading} id={parent.id}>
                  {parent.id}
                </AccordionSummary>
              </Grid>
              {/* Color Picker Dialog */}
              <Grid item xs={1}>
                <IconButton className={toolClass.toolBtn} onClick={() => toggleColorPickerDialog(parent)}>
                  <ColorLens style={{ color: parent.colorCode }} />
                </IconButton>
                <Dialog open={parent.colorpickerOpen} onClose={() => toggleColorPickerDialog(parent)}>
                  <DialogTitle>{parent.id}</DialogTitle>
                  <DialogContent style={{ height: 300 }}>
                    <ColorPicker
                      name="color"
                      defaultValue={parent.colorCode}
                      onChange={(color: any) => {
                        updateParent(parent.id, { colorCode: color });
                      }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => toggleColorPickerDialog(parent)}>Close</Button>
                  </DialogActions>
                </Dialog>
                {/* old way
                <ColorPicker
                  name="color"
                  defaultValue={parent.colorCode}
                  onChange={(color: any) => {
                    updateParent(parent.id, { colorCode: color });
                  }}
                />*/}
              </Grid>

              {/*<Grid item xs={1} className={classes.spinnerGridItem} style={{ position: 'relative' }}>
                {parent.loaded === 100 ? <DoneIcon /> : <div>{getErrorIcon(timeLeft)}</div>}
              </Grid> */}
              <Grid item xs={1}>
                <DragHandle />
              </Grid>
            </Grid>
            {parent.children.map((child: any) => (
              <Grid container direction="row" justifyContent="flex-start" alignItems="center">
                &emsp;
                <Grid item xs={2}>
                  <Checkbox
                    checked={child.enabled}
                    name={child.id}
                    onChange={() => updateRenderedLayers(parent, child)}
                  />
                </Grid>
                <Grid item xs={5}>
                  <Tooltip disableFocusListener title={'tip of the tool'}>
                    <Button>{child.id}</Button>
                  </Tooltip>
                </Grid>
                {/* Child Dialog Box */}
                <Grid item xs={2}>
                  <IconButton onClick={() => toggleChildDialog(parent, child)}>
                    <SettingsIcon />
                  </IconButton>
                  <Dialog open={child.dialogOpen} onClose={() => toggleChildDialog(parent, child)}>
                    <DialogTitle>{child.name}</DialogTitle>
                    <DialogContent>
                      <FormControl style={{ marginTop: 10, marginLeft: 10, display: 'flex', flexFlow: 'row nowrap' }}>
                        <InputLabel>Layer</InputLabel>
                        <NativeSelect
                          id="layer-menu"
                          defaultValue={child.type}
                          onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                            updateChildAndLayer(parent, child, { type: event.target.value });
                          }}>
                          <option value={LayerMode.ActivitiesAndPOI}>{LayerMode.ActivitiesAndPOI}</option>
                          <option value={LayerMode.WMSOnline}>{LayerMode.WMSOnline}</option>
                          <option value={LayerMode.WFSOnline}>{LayerMode.WFSOnline}</option>
                          <option value={LayerMode.VectorTilesOffline}>{LayerMode.VectorTilesOffline}</option>
                          <option value={LayerMode.RegularFeaturesOffline}>{LayerMode.RegularFeaturesOffline}</option>
                        </NativeSelect>
                      </FormControl>
                      <div className={toolClass.toolSlider}>
                        <Typography style={{ marginRight: 10 }}>Opacity</Typography>
                        <Slider
                          defaultValue={child.opacity}
                          onChangeCommitted={(event: any, newOpacity: number | number[]) => {
                            updateChildAndLayer(parent, child, { opacity: newOpacity as number });
                          }}
                          getAriaValueText={opacityText}
                          step={0.0001}
                          min={0.0}
                          max={1.0}
                        />
                      </div>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => toggleChildDialog(parent, child)}>Close</Button>
                    </DialogActions>
                  </Dialog>
                </Grid>
                {/* <Grid item xs={2} style={{ position: 'relative' }}>
                  {child.loaded === 100 ? <DoneIcon /> : <div>{getErrorIcon(timeLeft)}</div>}
                        </Grid> */}
              </Grid>
            ))}
          </Accordion>
          {/*<ListItemSecondaryAction style={{ width: 32 }}></ListItemSecondaryAction>*/}
        </Grid>
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
    const returnVal = sortObject(objectState, oldIndex, newIndex);
    setObjectState(returnVal);
  };

  return (
    <LayersControlProvider value={null}>
      {layers.map((layer) => {
        return (
          <DataBCLayer opacity={layer.opacity} layerName={layer.BCGWcode} mode={layer.type} inputGeo={props.inputGeo} />
        );
      })}
      <div className={positionClass}>
        <PopupState variant="popover" popupId="layerPicker">
          {(popupState) => (
            <div
              className="leaflet-control leaflet-bar"
              /*onTouchStart={() => {
                props.map.dragging.disable();
                props.map.doubleClickZoom.disable();
              }}
              onTouchMove={() => {
                props.map.dragging.disable();
                props.map.doubleClickZoom.disable();
              }}
              onTouchEnd={() => {
                props.map.dragging.disable();
                props.map.doubleClickZoom.disable();
              }}
              onMouseOver={() => {
                if (Capacitor.getPlatform() == 'web') {
                  props.map.dragging.disable();
                  props.map.doubleClickZoom.disable();
                }
              }}
              onMouseOut={() => {
                if (Capacitor.getPlatform() == 'web') {
                  props.map.dragging.enable();
                  props.map.doubleClickZoom.enable();
                }
              }}*/ ref={divref}>
              <Paper>
                <IconButton {...bindTrigger(popupState)}>
                  <LayersIcon fontSize="medium" />
                </IconButton>
              </Paper>
              <Popover
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
                  items={sortArray(objectState)}
                  onSortEnd={onSortEnd}
                  useDragHandle={true}
                  lockAxis="y"
                />
              </Popover>
            </div>
          )}
        </PopupState>
      </div>
    </LayersControlProvider>
  );
}
