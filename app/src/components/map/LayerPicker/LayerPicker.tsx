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
  Popover
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
  const [opacity, setOpacity] = useState<number>(1.0);
  const [layermode, setLayerMode] = useState(LayerMode.WMSOnline as string);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'layerPicker' : undefined;
  const positionClass = (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright;
  const divref = useRef();

  useEffect(() => {
    if (divref?.current) {
      DomEvent.disableClickPropagation(divref?.current);
      DomEvent.disableScrollPropagation(divref?.current);
    }
  });

  const opacityText = (value: number) => {
    return `${value.toFixed(1)}`;
  };

  const handleSlider = (event: any, newOpacity: number | number[]) => {
    setOpacity(newOpacity as number);
  };

  const handleRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLayerMode((event.target as HTMLInputElement).value);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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

  const updateChildLayers = (parent, child) => {
    if (child.enabled) {
      var temp;
      for (let i in layers) {
        if (layers[i] === child.BCGWcode) {
          temp = i;
        }
      }
      layers.splice(temp, 1);
    } else if (!child.enabled) {
      setLayers([...layers, child.BCGWcode]);
    }
    updateChild(parent.id, child.id, {
      enabled: !getChild(objectState, parent.id, child.id).enabled
    });
  };

  const DragHandle = SortableHandle(() => (
    <ListItemIcon>
      <DragHandleIcon />
    </ListItemIcon>
  ));

  function WithCounter() {
    const [seconds, setSeconds] = React.useState(10);
    React.useEffect(() => {
      if (seconds > 0) {
        setTimeout(() => setSeconds(seconds - 1), 1000);
      }
    });
    return seconds;
  }

  function getErrorIcon(time: any) {
    return time === 0 ? <ErrorOutlineIcon /> : <CircularProgress />;
  }

  /*const RenderLayers = (props) => {
    // loop over all layers in config / layer picker state
    // return each layer with the right props / layer mode
    // return layers in right order
    return <></>;
  };*/

  //update context on ObjectState change
  useEffect(() => {
    setLayersSelected(objectState);
  }, [objectState]);

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
                  <Checkbox checked={child.enabled} name={child.id} onChange={() => updateChildLayers(parent, child)} />
                  {/*child.enabled ? <DataBCLayer layerName={child.BCGWcode} mode={LayerMode.WMSOnline} /> : null*/}
                </Grid>
                <Grid item xs={5}>
                  {child.id}
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

  useEffect(() => {
    console.log(layermode);
  }, [layermode]);

  return (
    <LayersControlProvider value={null}>
      <div className={positionClass}>
        {layers.map((layer) => (
          <DataBCLayer opacity={opacity} layerName={layer} mode={layermode} />
        ))}
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
                <div className={toolClass.toolSlider}>
                  <Typography>Opacity</Typography>
                  <Typography style={{ marginLeft: 10, marginRight: 10 }}>{opacityText(opacity)}</Typography>
                  <Slider
                    defaultValue={opacity}
                    onChange={handleSlider}
                    getAriaValueText={opacityText}
                    step={0.0001}
                    min={0.0}
                    max={1.0}
                  />
                </div>
                <FormControl style={{ marginLeft: 10 }} component="fieldset">
                  <RadioGroup aria-label="layer type" name="WMSOnline" value={layermode} onChange={handleRadio}>
                    <FormControlLabel value={LayerMode.WMSOnline} control={<Radio />} label="WMS" />
                    <FormControlLabel value={LayerMode.WFSOnline} control={<Radio />} label="WFS" />
                    <FormControlLabel value={LayerMode.VectorTilesOffline} control={<Radio />} label="Vector Tiles" />
                    <FormControlLabel
                      value={LayerMode.RegularFeaturesOffline}
                      control={<Radio />}
                      label="Regular Features"
                    />
                  </RadioGroup>
                </FormControl>
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
  {
    /*<Paper>
            <IconButton onClick={handleClick}>
              <LayersIcon fontSize="default" />
            </IconButton>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}>
              <div className={toolClass.toolSlider}>
                <Typography>Opacity</Typography>
                <Typography style={{ marginLeft: 10, marginRight: 10 }}>{opacityText(opacity)}</Typography>
                <Slider
                  defaultValue={opacity}
                  onChange={handleSlider}
                  getAriaValueText={opacityText}
                  step={0.0001}
                  min={0.0}
                  max={1.0}
                />
              </div>
              <FormControl style={{ marginLeft: 10 }} component="fieldset">
                <RadioGroup aria-label="layer type" name="WMSOnline" value={layermode} onChange={handleRadio}>
                  <FormControlLabel value={LayerMode.WMSOnline} control={<Radio />} label="WMS" />
                  <FormControlLabel value={LayerMode.WFSOnline} control={<Radio />} label="WFS" />
                  <FormControlLabel value={LayerMode.VectorTilesOffline} control={<Radio />} label="Vector Tiles" />
                  <FormControlLabel
                    value={LayerMode.RegularFeaturesOffline}
                    control={<Radio />}
                    label="Regular Features"
                  />
                </RadioGroup>
              </FormControl>
              <SortableListContainer
                items={sortArray(objectState)}
                onSortEnd={onSortEnd}
                useDragHandle={true}
                lockAxis="y"
              />
            </Popover>
          </Paper>*/
  }
}
