import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import {
  getObjectsAfterIndex,
  getObjectsBeforeIndex,
  DragHandle,
  getObjectByOrder,
  sortArray,
  getChild,
  updateChild
} from './SortLayerOrder';
import {
  Grid,
  List,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  Slider,
  DialogContent,
  DialogActions
} from '@material-ui/core';
import React, { useContext } from 'react';
import { updateParent } from './SortableParent';
import { Checkbox } from '@mui/material';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { LayerModeDialog } from '../LayerModeSelector';
import { toolStyles } from 'components/map/Tools/Helpers/ToolStyles';
import { DialogCloseBtn, getChildAction, toggleDialog } from '../LayersActionsHelper/LayersActionsFunctions';
import ColorLensIcon from '@material-ui/icons/ColorLens';
import ColorPicker from 'material-ui-color-picker';

/**
 * Function used to print opacity as text
 * @param value float to indicate an opacity between 0 and 1
 * @returns string value
 */
const opacityText = (value: number) => {
  return `${value.toFixed(1)}`;
};

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

const sortChildren = (children: any[], oldIndex: number, newIndex: number) => {
  let returnVal = [];
  if (newIndex > oldIndex) {
    let childrenBefore = getObjectsBeforeIndex(children, oldIndex);

    let newZindex = getObjectByOrder(children, newIndex).zIndex;
    let swapZindex = newZindex + 10;

    let loopIndex = oldIndex + 1;
    let inBetween: any[] = [];
    while (loopIndex < newIndex) {
      let obj: any = getObjectByOrder(children, loopIndex);
      obj.order = obj.order - 1;
      obj.zIndex = obj.zIndex + 10;
      inBetween.push({ ...obj });
      loopIndex += 1;
    }

    let objWeMoved: any = getObjectByOrder(children, oldIndex);
    objWeMoved.order = newIndex;
    objWeMoved.zIndex = newZindex;

    let objWeSwapped: any = getObjectByOrder(children, newIndex);
    objWeSwapped.order = newIndex - 1;
    objWeSwapped.zIndex = swapZindex;

    let childrenAfter = getObjectsAfterIndex(children, newIndex);

    const newState = [...childrenBefore, ...inBetween, objWeSwapped, objWeMoved, ...childrenAfter];

    returnVal = newState;
  } else if (newIndex < oldIndex) {
    let childrenBefore = getObjectsBeforeIndex(children, newIndex);

    let newZindex = getObjectByOrder(children, newIndex).zIndex;
    let swapZindex = newZindex - 10;

    let loopIndex = newIndex + 1;
    let inBetween: any[] = [];
    while (loopIndex < oldIndex) {
      let obj: any = getObjectByOrder(children, loopIndex);
      obj.order = obj.order + 1;
      obj.zIndex = obj.zIndex - 10;
      inBetween.push({ ...obj });
      loopIndex += 1;
    }

    let objWeMoved: any = getObjectByOrder(children, oldIndex);
    objWeMoved.order = newIndex;
    objWeMoved.zIndex = newZindex;

    let objWeSwapped: any = getObjectByOrder(children, newIndex);
    objWeSwapped.order = newIndex + 1;
    objWeSwapped.zIndex = swapZindex;

    let childrenAfter = getObjectsAfterIndex(children, oldIndex);

    const newState = [...childrenBefore, ...inBetween, objWeMoved, objWeSwapped, ...childrenAfter];
    returnVal = newState;
  } else return children;
  return returnVal;
};

export const SortableChild = (props: any) => {
  const toolClass = toolStyles();
  const mapLayersContext = useContext(MapRequestContext);
  const { layersSelected, setLayersSelected } = mapLayersContext;
  const { layersActions, setLayersActions } = mapLayersContext;

  const SortableChildLayer = SortableElement(({ child }: any) => {
    return (
      <Grid id={child.id} container style={{ marginBottom: -5, marginTop: -5 }} direction="row" alignItems="center">
        &emsp;
        <Grid item xs={1} alignContent="center" justifyContent="center">
          <Checkbox
            id="child-checkbox"
            checked={getChild(layersSelected, props.parent.id, child.id).enabled}
            name={child.name}
            onChange={() => {
              updateChild(layersSelected, setLayersSelected, props.parent.id, child.id, {
                enabled: !getChild(layersSelected, props.parent.id, child.id).enabled
              });
            }}
          />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="caption">{child.name}</Typography>
        </Grid>
        {process.env.REACT_APP_REAL_NODE_ENV === 'development' && (
          <Grid item xs={1}>
            <LayerModeDialog parent={props.parent} child={child} />
          </Grid>
        )}
        {process.env.REACT_APP_REAL_NODE_ENV === '' && (
          <Grid item xs={1}>
            <LayerModeDialog parent={props.parent} child={child} />
          </Grid>
        )}
        {/********** Dialog ColorPicker Start **********/}
        <Grid item xs={1}>
          <IconButton
            id="colorpicker-btn"
            className={toolClass.toolBtn}
            onClick={() =>
              toggleDialog(layersActions, setLayersActions, props.parent, child, { dialog_colorpicker_open: true })
            }>
            <ColorLensIcon id="color-lens" style={{ color: child.color_code }} />
          </IconButton>
          <Dialog
            id="layer-settings-dialog"
            open={getChildAction(layersActions, props.parent.id, child.id).dialog_colorpicker_open}
            onClose={() =>
              toggleDialog(layersActions, setLayersActions, props.parent, child, {
                dialog_colorpicker_open: false
              })
            }>
            <DialogTitle>{child.name}</DialogTitle>
            {/********** Opacity **********/}
            <DialogContent id="layer-opacity" style={{ width: 300 }}>
              <Typography id="slider-title" style={{ marginRight: 10 }}>
                Opacity
              </Typography>
              <Slider
                id="slider-control"
                defaultValue={child.opacity}
                onChangeCommitted={(event: any, newOpacity: number | number[]) =>
                  updateChild(layersSelected, setLayersSelected, props.parent.id, child.id, {
                    opacity: newOpacity
                  })
                }
                getAriaValueText={opacityText}
                step={0.0001}
                min={0.0}
                max={1.0}
              />
            </DialogContent>
            {/********** ColorPicker **********/}
            <DialogContent id="layer-colorpicker" style={{ height: 300 }}>
              <ColorPicker
                style={{ backgroundColor: child.color_code }}
                floatingLabelText={' '}
                name="color"
                defaultValue={child.color_code}
                onChange={(color: any) =>
                  updateChild(layersSelected, setLayersSelected, props.parent.id, child.id, { color_code: color })
                }
              />
            </DialogContent>
            {/********** Close Button **********/}
            <DialogActions>
              <DialogCloseBtn parent={props.parent} child={child} fieldsToUpdate={{ dialog_colorpicker_open: false }} />
            </DialogActions>
          </Dialog>
        </Grid>
        {/********** Dialog ColorPicker End **********/}
        <Grid item xs={1}>
          <DragHandle />
        </Grid>
      </Grid>
    );
  });

  const SortableListContainer = SortableContainer(({ items }: any) => (
    <List>
      {items.map((child: { id: string; order: number }) => (
        <SortableChildLayer key={child.id} index={child.order} child={child} />
      ))}
    </List>
  ));

  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    const returnVal = sortChildren(props.parent.children, oldIndex, newIndex);
    updateParent(props.parent.id, { children: sortArray(returnVal) }, layersSelected, setLayersSelected);
  };

  return (
    <>
      {props.parent.children && (
        <SortableListContainer
          items={sortArray(props.parent.children)}
          onSortEnd={onSortEnd}
          useDragHandle={true}
          lockAxis="y"
        />
      )}
    </>
  );
};
