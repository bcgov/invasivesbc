import React, { useEffect, useContext, useRef } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
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
import ColorLens from '@material-ui/icons/ColorLens';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// MUI Icons
import LayersIcon from '@material-ui/icons/Layers';
import SettingsIcon from '@material-ui/icons/Settings';
import KMLUpload from 'components/map-buddy-components/KMLUpload';
import { ColorPicker } from 'material-ui-color';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { IndependentLayer } from '../LayerLoaderHelpers/IndependentRenderLayers';
import { addOrRemoveLayer, LayersSelector, updateLayer } from './LayersSelectorAndRender';
import { ThemeContext } from 'contexts/themeContext';

export const updateChild = (parentId: string, childId: string, fieldsToUpdate: Object, objectState, setObjectState) => {
  // sort parents, get index of parent
  let pIndex = getParentIndex(objectState, parentId);
  // sort child of specific parent, get index of child
  let cIndex = getChildIndex(objectState, parentId, childId);
  // get old child and overwrite fields with fields in fieldsToUpdate
  const oldChild = getChild(objectState, parentId, childId);
  const updatedChild = { ...oldChild, ...fieldsToUpdate };
  // break up slicing into chunks:
  let parentsBefore = getObjectsBeforeIndex(objectState, pIndex);
  let parentsAfter = getObjectsAfterIndex(objectState, pIndex);
  //spread to avoid reference issue when copying
  const oldParent = getParent(objectState, parentId);

  const childrenBefore = getChildObjBeforeIndex(objectState, pIndex, cIndex);
  const childrenAfter = getChildObjAfterIndex(objectState, pIndex, cIndex);

  const newParent = {
    ...oldParent,
    children: [...childrenBefore, updatedChild, ...childrenAfter]
  };

  setObjectState([...parentsBefore, newParent, ...parentsAfter] as any);
};

export function LayerPicker(props: any) {
  const mapLayersContext = useContext(MapRequestContext);
  const { layersSelected, setLayersSelected } = mapLayersContext;
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

  /* log to check enabled layers: 
  useEffect(() => {
    console.log('================');
    layersSelected.forEach((parent) => {
      parent.children.forEach((child) => {
        if (child.enabled) {
          console.log(child.id, parent.order, parent.zIndex);
        }
      });
    });
  }, [layersSelected]);*/

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
    let pIndex = getParentIndex(layersSelected, parentId);
    let parentsBefore: Object[] = getObjectsBeforeIndex(layersSelected, pIndex);
    let parentsAfter: Object[] = getObjectsAfterIndex(layersSelected, pIndex);
    const oldParent = getParent(layersSelected, parentId);
    const updatedParent = { ...oldParent, ...fieldsToUpdate };
    setLayersSelected([...parentsBefore, updatedParent, ...parentsAfter] as any);
  };

  const toggleDialogClose = (parent: any, child: any, fieldsToUpdate: Object) => {
    updateChild(parent.id, child.id, fieldsToUpdate, layersSelected, setLayersSelected);
  };

  const SortableParentLayer = SortableElement(({ parent }) => {
    const onParentLayerAccordionChange = (event: any, expanded: any) => {
      updateParent(parent.id, { expanded: expanded });
    };
    const DragHandle = SortableHandle(() => (
      <ListItemIcon>{parent.expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}</ListItemIcon>
    ));
    return (
      <ListItem id={parent.id} dense={true} ContainerComponent="div" style={{ width: '100%', maxWidth: 440 }}>
        <Accordion
          id="parent-accordion"
          expanded={parent.expanded}
          onChange={onParentLayerAccordionChange}
          style={{ width: '100%' }}>
          <Grid id="accordion-grid" container style={{ marginTop: -10, marginBottom: -10 }} alignItems="center" xs={12}>
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
          {parent.children.map((child: any) => (
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
                  checked={child.enabled}
                  name={child.name}
                  onChange={() => {
                    addOrRemoveLayer(parent, child, layersSelected, setLayersSelected);
                    updateChild(
                      parent.id,
                      child.id,
                      { enabled: !getChild(layersSelected, parent.id, child.id).enabled },
                      layersSelected,
                      setLayersSelected
                    );
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">{child.name}</Typography>
              </Grid>
              {/* Settings Dialog Box */}
              {process.env.REACT_APP_REAL_NODE_ENV === 'development' && (
                <LayerModeDialog
                  parent={parent}
                  child={child}
                  toggleDialogClose={toggleDialogClose}
                  layers={layersSelected}
                  setLayers={setLayersSelected}
                />
              )}
              {process.env.REACT_APP_REAL_NODE_ENV === 'local' && (
                <LayerModeDialog
                  parent={parent}
                  child={child}
                  layers={layersSelected}
                  setLayers={setLayersSelected}
                  toggleDialogClose={toggleDialogClose}
                />
              )}
              <Grid item xs={1}>
                <IconButton
                  id="colorpicker-btn"
                  className={toolClass.toolBtn}
                  onClick={() => toggleDialogClose(parent, child, { dialog_colorpicker_open: true })}>
                  <ColorLens id="color-lens" style={{ color: child.color_code }} />
                </IconButton>
                <Dialog
                  id="layer-settings-dialog"
                  open={child.dialog_colorpicker_open}
                  onClose={() => toggleDialogClose(parent, child, { dialog_colorpicker_open: false })}>
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
                        updateChild(
                          parent.id,
                          child.id,
                          { opacity: newOpacity as number },
                          layersSelected,
                          setLayersSelected
                        );
                        updateLayer({ opacity: newOpacity as number }, layersSelected, setLayersSelected, child.id);
                      }}
                      getAriaValueText={opacityText}
                      step={0.0001}
                      min={0.0}
                      max={1.0}
                    />
                  </DialogContent>
                  {/* Color Picker */}s
                  <DialogContent id="layer-colorpicker" style={{ height: 300 }}>
                    <ColorPicker
                      style={{
                        backgroundColor: child.color_code
                      }}
                      floatingLabelText={' '}
                      name="color"
                      defaultValue={child.color_code}
                      onChange={(color: any) => {
                        updateChild(parent.id, child.id, { color_code: color }, layersSelected, setLayersSelected);
                      }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      id="close-btn"
                      onClick={() => toggleDialogClose(parent, child, { dialog_colorpicker_open: false })}>
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
      {layersSelected.map((parent) => {
        return (
          <>
            {parent.children.map((child) => {
              var zIndex = parent.zIndex + child.zIndex;
              return (
                child.enabled && (
                  <DataBCLayer
                    opacity={child.opacity}
                    layerName={child.bcgw_code}
                    mode={child.layer_mode}
                    inputGeo={props.inputGeo}
                    zIndex={zIndex}
                    setWellIdandProximity={props.setWellIdandProximity}
                    color_code={child.color_code}
                  />
                )
              );
            })}
          </>
        );
      })}
      {/*layersSelected?.forEach((layer) => (
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
          ))*/}
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
}

const LayerModeDialog = (props) => {
  return (
    <Grid item xs={2}>
      <IconButton
        id="settings-btn"
        onClick={() => props.toggleDialogClose(props.parent, props.child, { dialog_layerselector_open: true })}>
        <SettingsIcon />
      </IconButton>
      <Dialog
        id="layermode-settings-dialog"
        open={props.child.dialog_layerselector_open}
        onClose={() => props.toggleDialogClose(props.parent, props.child, { dialog_layerselector_open: false })}>
        <DialogTitle>{props.child.name}</DialogTitle>
        <LayersSelector
          parent={props.parent}
          child={props.child}
          objectState={props.objectState}
          setObjectState={props.setObjectState}
          layers={props.newLayers}
          setLayers={props.setNewLayers}
        />
        <DialogActions id="close-dialog-action">
          <Button
            id="close-btn"
            onClick={() => props.toggleDialogClose(props.parent, props.child, { dialog_layerselector_open: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};
