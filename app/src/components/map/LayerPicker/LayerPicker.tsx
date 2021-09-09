import React, { useState, useEffect, useContext, useRef } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import DragHandleIcon from '@material-ui/icons/DragHandle';
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
import ColorPicker from 'material-ui-color-picker';
import { Circle, LayerGroup, TileLayer, useMap } from 'react-leaflet';
import { Capacitor } from '@capacitor/core';
import { MapRequestContext } from 'contexts/MapRequestsContext';
// for confirming loaded layers
import DoneIcon from '@material-ui/icons/Done';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Popover,
  Button,
  Menu,
  MenuItem,
  Select,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  NativeSelect
} from '@material-ui/core';
import { toolStyles } from '../Tools/ToolBtnStyles';
import LayersIcon from '@material-ui/icons/Layers';
import { LayersControlProvider } from './layerControlContext';
import { DataBCLayer, LayerMode } from '../LayerLoaderHelpers/DataBCRenderLayer';
import SettingsIcon from '@material-ui/icons/Settings';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { DomEvent } from 'leaflet';

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

  //update context on ObjectState change
  useEffect(() => {
    setLayersSelected(objectState);
  }, [objectState]);

  useEffect(() => {
    console.dir(layers);
  }, [layers]);

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
      var temp;
      for (let i in layers) {
        if (layers[i].BCGWcode === child.BCGWcode) {
          temp = i;
        }
      }
      var spliced = layers.splice(temp, 1);
      console.log('spliced', spliced);
      var layersBefore = [...layers.slice(0, temp)];
      console.log('layers before', layersBefore);
      var layersAfter = [...layers.slice(temp)];
      console.log('layers after', layersAfter);
      setLayers([...layersBefore, ...layersAfter]);
    } else if (!child.enabled) {
      setLayers([...layers, { BCGWcode: child.BCGWcode, opacity: child.opacity, type: child.type }]);
    }
    updateChild(parent.id, child.id, {
      enabled: !getChild(objectState, parent.id, child.id).enabled
    });
  };

  const updateChildAndLayer = (parent, child, fieldsToUpdate: Object) => {
    updateLayer(child, fieldsToUpdate);
    updateChild(parent.id, child.id, fieldsToUpdate);
  };

  const closeDialog = (parent, child) => {
    updateChild(parent.id, child.id, {
      dialogOpen: !getChild(objectState, parent.id, child.id).dialogOpen
    });
  };

  const DragHandle = SortableHandle(() => (
    <ListItemIcon>
      <DragHandleIcon />
    </ListItemIcon>
  ));

  const SortableParentLayer = SortableElement(({ parent }) => {
    const onParentLayerAccordionChange = (event: any, expanded: any) => {
      updateParent(parent.id, { expanded: expanded });
    };
    return (
      <ListItem ContainerComponent="div" style={{ width: '100%', maxWidth: 360 }}>
        <Grid container xs={12} spacing={1}>
          <Accordion expanded={parent.expanded} onChange={onParentLayerAccordionChange} className={classes.accordion}>
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid item xs>
                <Checkbox
                  checked={parent.enabled}
                  name={parent.id}
                  onChange={() => {
                    updateParent(parent.id, {
                      enabled: !getParent(objectState, parent.id).enabled
                    });
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.heading} id={parent.id}>
                  {parent.id}
                </AccordionSummary>
              </Grid>
              <Grid item xs={2} style={{ backgroundColor: parent.colorCode }}>
                <ColorPicker
                  name="color"
                  defaultValue={parent.colorCode}
                  onChange={(color: any) => {
                    updateParent(parent.id, { colorCode: color });
                  }}
                />
              </Grid>
              <Grid item xs className={classes.spinnerGridItem} style={{ position: 'relative' }}>
                {parent.loaded === 100 ? <DoneIcon /> : <div>{getErrorIcon(timeLeft)}</div>}
              </Grid>
              <Grid item xs>
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
                  {child.id}
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() =>
                      updateChild(parent.id, child.id, {
                        dialogOpen: !getChild(objectState, parent.id, child.id).dialogOpen
                      })
                    }>
                    <SettingsIcon />
                  </IconButton>
                  <Dialog open={child.dialogOpen} onClose={() => closeDialog(parent, child)}>
                    <DialogTitle>{child.id}</DialogTitle>
                    <DialogContent>
                      <FormControl style={{ marginTop: 10, marginLeft: 10, display: 'flex', flexFlow: 'row nowrap' }}>
                        <InputLabel>Layer</InputLabel>
                        <NativeSelect
                          id="layer-menu"
                          defaultValue={LayerMode.WMSOnline}
                          onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                            updateChildAndLayer(parent, child, { type: event.target.value });
                          }}>
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
                      <Button onClick={() => closeDialog(parent, child)}>Close</Button>
                    </DialogActions>
                  </Dialog>
                </Grid>
                <Grid item xs={2} style={{ position: 'relative' }}>
                  {child.loaded === 100 ? <DoneIcon /> : <div>{getErrorIcon(timeLeft)}</div>}
                </Grid>
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
      <div className={positionClass}>
        {layers.map(
          (layer) => (
            <DataBCLayer opacity={layer.opacity} layerName={layer.BCGWcode} mode={layer.type} />
          ),
          [layers]
        )}
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
                  <LayersIcon fontSize="default" />
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
