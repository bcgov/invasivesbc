import React, { useState, useEffect, useContext, useRef } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { LayersControlProvider } from './layerControlContext';
import { DataBCLayer } from '../LayerLoaderHelpers/DataBCRenderLayer';
import { DomEvent } from 'leaflet';
import { MapRequestContext } from 'contexts/MapRequestsContext';
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
  Popover,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent
} from '@material-ui/core';
import ColorPicker from 'material-ui-color-picker';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
// MUI Icons
import LayersIcon from '@material-ui/icons/Layers';
import ColorLens from '@material-ui/icons/ColorLens';
import SettingsIcon from '@material-ui/icons/Settings';
import DoneIcon from '@material-ui/icons/Done';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { LayersSelector, addOrRemoveLayer, updateLayer } from './LayersSelectorAndRender';

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

export const updateChild = (
  parentType: string,
  childType: string,
  fieldsToUpdate: Object,
  { objectState, setObjectState }
) => {
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

export function LayerPicker(props: any, { position }) {
  const classes = useStyles();
  const toolClass = toolStyles();
  const mapLayersContext = useContext(MapRequestContext);
  const { layersSelected, setLayersSelected } = mapLayersContext;
  const [objectState, setObjectState] = useState(layersSelected);
  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
  const divref = useRef();
  const [newLayers, setNewLayers] = useState([]);

  function getErrorIcon(time: any) {
    return time === 0 ? <ErrorOutlineIcon /> : <CircularProgress />;
  }

  /* removed for now 
  function WithCounter() {
    const [seconds, setSeconds] = React.useState(10);
    React.useEffect(() => {
      if (seconds > 0) {
        setTimeout(() => setSeconds(seconds - 1), 1000);
      }
    });
    return seconds;
  }*/

  //update context on ObjectState change
  useEffect(() => {
    setLayersSelected(newLayers);
  }, [newLayers]);

  useEffect(() => {
    if (divref?.current) {
      DomEvent.disableClickPropagation(divref?.current);
      DomEvent.disableScrollPropagation(divref?.current);
    }
  });

  const opacityText = (value: number) => {
    return `${value.toFixed(1)}`;
  };

  const updateParent = (parentType: string, fieldsToUpdate: Object) => {
    let pIndex = getParentIndex(objectState, parentType);
    let parentsBefore: Object[] = getObjectsBeforeIndex(objectState, pIndex);
    let parentsAfter: Object[] = getObjectsAfterIndex(objectState, pIndex);
    const oldParent = getParent(objectState, parentType);
    const updatedParent = { ...oldParent, ...fieldsToUpdate };
    setObjectState([...parentsBefore, updatedParent, ...parentsAfter] as any);
  };

  const toggleChildDialog = (parent, child, open: boolean) => {
    updateChild(
      parent.id,
      child.id,
      {
        dialog_open: open
      },
      { objectState, setObjectState }
    );
  };

  const toggleColorPickerDialog = (parent) => {
    updateParent(parent.id, {
      colorpicker_open: !getParent(objectState, parent.id).colorpicker_open
    });
  };

  const DragHandle = (expanded: boolean) =>
    SortableHandle(() => <ListItemIcon>{expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}</ListItemIcon>);

  const SortableParentLayer = SortableElement(({ parent }) => {
    const onParentLayerAccordionChange = (event: any, expanded: any) => {
      updateParent(parent.id, { expanded: expanded });
    };
    return (
      <ListItem ContainerComponent="div" style={{ width: '100%', maxWidth: 360 }}>
        <Grid container spacing={1}>
          <Accordion expanded={parent.expanded} onChange={onParentLayerAccordionChange} className={classes.accordion}>
            <Grid container xs={12} justifyContent="space-between" alignItems="center">
              {/* removed for now
              <Grid item xs={1}>
                <Tooltip disableFocusListener classes={{ tooltip: classes.tooltipWidth }} title={parent.id}>
                  <IconButton onClick={() => toggleInfoDialog(parent)}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
                */}
              <Grid item xs={7}>
                <AccordionSummary className={classes.heading} id={parent.id}>
                  <Typography variant="caption">{parent.name}</Typography>
                </AccordionSummary>
              </Grid>
              {/* Color Picker Dialog */}
              <Grid item xs={1}>
                <IconButton className={toolClass.toolBtn} onClick={() => toggleColorPickerDialog(parent)}>
                  <ColorLens style={{ color: parent.color_code }} />
                </IconButton>
                <Dialog open={parent.colorpicker_open} onClose={() => toggleColorPickerDialog(parent)}>
                  <DialogTitle>{parent.name}</DialogTitle>
                  <DialogContent style={{ height: 300 }}>
                    <ColorPicker
                      name="color"
                      defaultValue={parent.color_code}
                      onChange={(color: any) => {
                        updateParent(parent.id, { color_code: color });
                      }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => toggleColorPickerDialog(parent)}>Close</Button>
                  </DialogActions>
                </Dialog>
              </Grid>
              <Grid item xs={1}>
                <DragHandle expanded={parent.expanded} />
              </Grid>
            </Grid>
            {parent.children.map((child: any) => (
              <Grid container direction="row" justifyContent="flex-start" alignItems="center">
                &emsp;
                <Grid item xs={2}>
                  <Checkbox
                    checked={child.enabled}
                    name={child.id}
                    onChange={() => {
                      addOrRemoveLayer(child, newLayers, setNewLayers);
                      updateChild(
                        parent.id,
                        child.id,
                        { enabled: !getChild(objectState, parent.id, child.id).enabled },
                        { objectState, setObjectState }
                      );
                    }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="caption">{child.name}</Typography>
                </Grid>
                {/* Child Dialog Box */}
                <Grid item xs={2}>
                  <IconButton onClick={() => toggleChildDialog(parent, child, true)}>
                    <SettingsIcon />
                  </IconButton>
                  <Dialog open={child.dialog_open} onClose={() => toggleChildDialog(parent, child, false)}>
                    <DialogTitle>{child.name ? <>{child.name}</> : child.id}</DialogTitle>
                    {child.id === 'activities' && (
                      <DialogContent style={{ height: 300 }}>
                        <ColorPicker
                          name="color"
                          defaultValue={child.color_code}
                          onChange={(color: any) => {
                            updateChild(parent.id, child.id, { color_code: color }, { objectState, setObjectState });
                            updateLayer({ color_code: color }, child, newLayers, setNewLayers);
                          }}
                        />
                      </DialogContent>
                    )}
                    {child.id === 'poi' && (
                      <DialogContent style={{ height: 300, width: 300 }}>
                        <ColorPicker
                          name="color"
                          defaultValue={child.color_code}
                          onChange={(color: any) => {
                            updateChild(parent.id, child.id, { color_code: color }, { objectState, setObjectState });
                            updateLayer({ color_code: color }, child, newLayers, setNewLayers);
                          }}
                        />
                      </DialogContent>
                    )}
                    {child.id !== 'activities' && child.id !== 'poi' && (
                      <DialogContent style={{ height: 300, width: 300 }}>
                        <LayersSelector
                          parent={parent}
                          child={child}
                          objectState={objectState}
                          setObjectState={setObjectState}
                          layers={newLayers}
                          setLayers={setNewLayers}
                        />
                        <Typography style={{ marginRight: 10 }}>Opacity</Typography>
                        <Slider
                          defaultValue={child.opacity}
                          onChangeCommitted={(event: any, newOpacity: number | number[]) => {
                            updateChild(
                              parent.id,
                              child.id,
                              { opacity: newOpacity as number },
                              { objectState, setObjectState }
                            );
                            updateLayer({ opacity: newOpacity as number }, child, newLayers, setNewLayers);
                          }}
                          getAriaValueText={opacityText}
                          step={0.0001}
                          min={0.0}
                          max={1.0}
                        />
                      </DialogContent>
                    )}
                    <DialogActions>
                      <Button
                        onClick={() =>
                          updateChild(
                            parent.id,
                            child.id,
                            {
                              dialog_open: false
                            },
                            { objectState, setObjectState }
                          )
                        }>
                        Close
                      </Button>
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
      {newLayers.map((layer) => (
        <DataBCLayer
          opacity={layer.opacity}
          layerName={layer.bcgw_code}
          mode={layer.layer_mode}
          inputGeo={props.inputGeo}
          setWellIdandProximity={props.setWellIdandProximity}
          color_code={layer.color_code}
        />
      ))}
      <div className={positionClass}>
        <PopupState variant="popover" popupId="layerPicker">
          {(popupState) => (
            <div className="leaflet-control leaflet-bar" ref={divref}>
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
                <Button
                  onClick={() => {
                    localStorage.setItem('mySave', JSON.stringify(objectState));
                  }}>
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setObjectState(JSON.parse(localStorage.getItem('mySave')));
                  }}>
                  Load
                </Button>
              </Popover>
            </div>
          )}
        </PopupState>
      </div>
    </LayersControlProvider>
  );
}
