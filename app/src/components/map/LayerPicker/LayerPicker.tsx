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
import { layerPickerStyles, toolStyles } from '../Tools/Helpers/ToolStyles';
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
import { IndependentLayer } from '../LayerLoaderHelpers/IndependentRenderLayers';
import KMLUpload from 'components/map-buddy-components/KMLUpload';

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

export function LayerPicker(props: any) {
  const classes = layerPickerStyles();
  const toolClass = toolStyles();
  const mapLayersContext = useContext(MapRequestContext);
  const { layersSelected, setLayersSelected } = mapLayersContext;
  const [objectState, setObjectState] = useState(layersSelected);
  const divref = useRef();
  const [newLayers, setNewLayers] = useState([]);

  useEffect(() => {
    console.log('sorted', newLayers);
  }, [newLayers]);
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

  /**
   * Function used to print opacity as text
   * @param value float to indicate an opacity between 0 and 1
   * @returns string value
   */
  const opacityText = (value: number) => {
    return `${value.toFixed(1)}`;
  };

  /**
   * Function used to update parent object in the objectState
   * @param parentId specified string of a parent object
   * @param fieldsToUpdate specified field to update e.g. { id: "newId" }
   */
  const updateParent = (parentId: string, fieldsToUpdate: Object) => {
    let pIndex = getParentIndex(objectState, parentId);
    let parentsBefore: Object[] = getObjectsBeforeIndex(objectState, pIndex);
    let parentsAfter: Object[] = getObjectsAfterIndex(objectState, pIndex);
    const oldParent = getParent(objectState, parentId);
    const updatedParent = { ...oldParent, ...fieldsToUpdate };
    setObjectState([...parentsBefore, updatedParent, ...parentsAfter] as any);
  };

  /**
   * Function used to open or close the Settings Dialog Box
   * @param parent object from objectState (LAYERS.json)
   * @param child object from parent children array
   * @param open if true opens dialog box otherwise close
   */
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

  /**
   * Function to open the color picker dialog box
   * @param parent object from objectState (LAYERS.json)
   * @param child object from parent children array
   */
  const toggleColorPickerDialog = (parent, child) => {
    updateChild(
      parent.id,
      child.id,
      {
        colorpicker_open: !getChild(objectState, parent.id, child.id).colorpicker_open
      },
      { objectState, setObjectState }
    );
  };

  const SortableParentLayer = SortableElement(({ parent }) => {
    const onParentLayerAccordionChange = (event: any, expanded: any) => {
      updateParent(parent.id, { expanded: expanded });
    };
    const DragHandle = SortableHandle(() => (
      <ListItemIcon>{parent.expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}</ListItemIcon>
    ));
    return (
      <ListItem dense={true} ContainerComponent="div" style={{ width: '100%', maxWidth: 440 }}>
        {/*<Grid container>*/}
        <Accordion expanded={parent.expanded} onChange={onParentLayerAccordionChange} className={classes.accordion}>
          <Grid container style={{ marginTop: -10, marginBottom: -10 }} alignItems="center" xs={12}>
            <Grid item xs={10}>
              <AccordionSummary className={classes.heading} id={parent.id}>
                <Typography variant="subtitle1">{parent.name}</Typography>
              </AccordionSummary>
            </Grid>
            {/* DragHandle */}
            <Grid item xs={1}>
              <DragHandle />
            </Grid>
          </Grid>
          {parent.children.map((child: any) => (
            <Grid container style={{ marginBottom: -5, marginTop: -5 }} direction="row" alignItems="center">
              &emsp;
              <Grid item xs={2}>
                <Checkbox
                  checked={child.enabled}
                  name={child.id}
                  onChange={() => {
                    addOrRemoveLayer(parent, child, newLayers, setNewLayers);
                    updateChild(
                      parent.id,
                      child.id,
                      { enabled: !getChild(objectState, parent.id, child.id).enabled },
                      { objectState, setObjectState }
                    );
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">{child.name}</Typography>
              </Grid>
              {/* Settings Dialog Box */}
              <Grid item xs={2}>
                <IconButton onClick={() => toggleChildDialog(parent, child, true)}>
                  <SettingsIcon />
                </IconButton>
                <Dialog open={child.dialog_open} onClose={() => toggleChildDialog(parent, child, false)}>
                  <DialogTitle>{child.name}</DialogTitle>
                  <LayersSelector
                    parent={parent}
                    child={child}
                    objectState={objectState}
                    setObjectState={setObjectState}
                    layers={newLayers}
                    setLayers={setNewLayers}
                  />
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
              <Grid item xs={1}>
                <IconButton className={toolClass.toolBtn} onClick={() => toggleColorPickerDialog(parent, child)}>
                  <ColorLens style={{ color: child.color_code }} />
                </IconButton>
                <Dialog open={child.colorpicker_open} onClose={() => toggleColorPickerDialog(parent, child)}>
                  <DialogTitle>{child.name}</DialogTitle>
                  {/* Opacity */}
                  <DialogContent style={{ width: 300 }}>
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
                  {/* Color Picker */}
                  <DialogContent style={{ height: 300 }}>
                    <ColorPicker
                      style={{
                        backgroundColor: child.color_code
                      }}
                      floatingLabelText={' '}
                      name="color"
                      defaultValue={child.color_code}
                      onChange={(color: any) => {
                        updateChild(parent.id, child.id, { color_code: color }, { objectState, setObjectState });
                      }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => toggleColorPickerDialog(parent, child)}>Close</Button>
                  </DialogActions>
                </Dialog>
              </Grid>
              {/* <Grid item xs={2} style={{ position: 'relative' }}>
                  {child.loaded === 100 ? <DoneIcon /> : <div>{getErrorIcon(timeLeft)}</div>}
                        </Grid> */}
            </Grid>
          ))}
        </Accordion>
        {/*</Grid>*/}
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
    <>
      {newLayers.map((layer) => (
        <>
          {layer.bcgw_code && (
            <DataBCLayer
              opacity={layer.opacity}
              layerName={layer.bcgw_code}
              mode={layer.layer_mode}
              inputGeo={props.inputGeo}
              setWellIdandProximity={props.setWellIdandProximity}
              color_code={layer.color_code}
            />
          )}
          {layer.layer_code && (
            <IndependentLayer opacity={layer.opacity} layerName={layer.layer_code} color_code={layer.color_code} />
          )}
        </>
      ))}
      <PopupState variant="popover" popupId="layerPicker">
        {(popupState) => (
          <>
            <Paper>
              <IconButton style={{ height: 53, width: 53 }} {...bindTrigger(popupState)}>
                <LayersIcon />
              </IconButton>
            </Paper>
            <Popover
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
              <Accordion>
                <AccordionSummary>KML upload</AccordionSummary>
                <KMLUpload />
              </Accordion>
            </Popover>
          </>
        )}
      </PopupState>
    </>
  );
}
