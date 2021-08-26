import React, { useState, useEffect, useContext } from 'react';
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
} from './LayerPickerHelper';
import ColorPicker from 'material-ui-color-picker';
import { TileLayer, useMap } from 'react-leaflet';
import { Capacitor } from '@capacitor/core';
import { MapRequestContext } from 'contexts/MapRequestsContext';
// for confirming loaded layers
import DoneIcon from '@material-ui/icons/Done';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import LayersIcon from '@material-ui/icons/Layers';
import {
  Checkbox,
  IconButton,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Grid,
  ListItemSecondaryAction,
  ListItemIcon,
  ListItem,
  List,
  CircularProgress,
  AccordionSummary,
  Accordion,
  makeStyles,
  Popover
} from '@material-ui/core';
import IMapContainerProps from '../MapContainer2';
import { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import { GeoJSON } from 'react-leaflet';
import TempPOILoader from '../LayerLoaderHelpers/TempPOILoader';
import { ThemeContext } from 'contexts/themeContext';
import { toolStyles } from '../Tools/ToolBtnStyles';

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

export function LayerPicker(props: any) {
  const classes = useStyles();
  const toolClass = toolStyles();
  const mapLayersContext = useContext(MapRequestContext);
  const timeLeft = WithCounter();
  const map = useMap();
  const themeContext = useContext(ThemeContext);
  const { layersSelected, setLayersSelected } = mapLayersContext;
  const [objectState, setObjectState] = useState(layersSelected);
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState('default');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

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

  function getSateliteMap(radioValue: any) {
    return radio === 'default' ? (
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
    ) : null;
  }

  function getOpenStreetMap(radioValue: any) {
    return radio === 'other' ? <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> : null;
  }

  //update context on ObjectState change
  useEffect(() => {
    setLayersSelected(objectState);
  }, [objectState]);

  const SortableParentLayer = SortableElement(({ parent }) => {
    const onParentLayerAccordionChange = (event: any, expanded: any) => {
      updateParent(parent.id, { expanded: expanded });
    };
    return (
      <ListItem ContainerComponent="div">
        <Grid container xs={12}>
          <Accordion expanded={parent.expanded} onChange={onParentLayerAccordionChange} className={classes.accordion}>
            <Grid container justifyContent="flex-start" alignItems="center">
              <Grid item xs={1}>
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
              <Grid item xs={6}>
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
              <Grid item xs={1} className={classes.spinnerGridItem} style={{ position: 'relative' }}>
                {parent.loaded === 100 ? <DoneIcon /> : <div>{getErrorIcon(timeLeft)}</div>}
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
                      updateChild(parent.id, child.id, {
                        enabled: !getChild(objectState, parent.id, child.id).enabled
                      });
                    }}
                  />
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
          <ListItemSecondaryAction>
            <DragHandle />
          </ListItemSecondaryAction>
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

  const handleCheckboxChange = (event) => {
    setChecked(event.target.checked);
  };
  const handleRadioChange = (event) => {
    setRadio(event.target.value);
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div style={{ zIndex: 1000 }}>
      <IconButton
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        onClick={handleClick}>
        <LayersIcon />
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
        <div
          onTouchStart={() => {
            map.dragging.disable();
            map.doubleClickZoom.disable();
          }}
          onTouchMove={() => {
            map.dragging.disable();
            map.doubleClickZoom.disable();
          }}
          onTouchEnd={() => {
            map.dragging.disable();
            map.doubleClickZoom.disable();
          }}
          onMouseOver={() => {
            if (Capacitor.getPlatform() == 'web') {
              map.dragging.disable();
              map.doubleClickZoom.disable();
            }
          }}
          onMouseOut={() => {
            if (Capacitor.getPlatform() == 'web') {
              map.dragging.enable();
              map.doubleClickZoom.enable();
            }
          }}>
          <FormControl
            style={{
              display: 'flex',
              marginLeft: '10px'
            }}>
            <RadioGroup row value={radio} onChange={handleRadioChange}>
              <FormControlLabel value="default" control={<Radio />} label="default" />
              {getSateliteMap(radio)}
              <FormControlLabel value="other" control={<Radio />} label="other" />
              {getOpenStreetMap(radio)}
            </RadioGroup>
          </FormControl>
          <FormControl
            style={{
              display: 'flex',
              marginLeft: '10px'
            }}>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={handleCheckboxChange} />}
              label="Activities"
            />
          </FormControl>
          <SortableListContainer
            items={sortArray(objectState)}
            onSortEnd={onSortEnd}
            useDragHandle={true}
            lockAxis="y"
          />
        </div>
      </Popover>
      {checked ? (
        <>
          {/*<TempPOILoader pointOfInterestFilter={props.pointOfInterestFilter} ></TempPOILoader>*/}
          {/*<GeoJSON data={props.interactiveGeometryState?.interactiveGeometry} />*/}
          {/*<GeoJSON data={vanIsland} onEachFeature={setupFeature} />*/}
        </>
      ) : null}
    </div>
  );
}
