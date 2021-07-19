import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CircularProgress from '@material-ui/core/CircularProgress';
import Checkbox from '@material-ui/core/Checkbox';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
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
  getParentByOrder,
  sortObject
} from './LayerPickerHelper';
import Grid from '@material-ui/core/Grid';
import ColorPicker from 'material-ui-color-picker';
import * as L from 'leaflet';
import { DragHandle } from '@material-ui/icons';
import { useMapEvent } from 'react-leaflet';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%'
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
  const [objectState, setObjectState] = useState(props.data);
  // Progress bar
  // const [progress, setProgress] = useState(props.progress);

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

  const [state, setState] = React.useState(true);

  const colorRef = React.useRef();
  console.log(state);

  /* Only for ReactLeaflet */
  React.useEffect(() => {
    //if(divRef?.current)
    //console.log('in hook');
    if (colorRef?.current) console.log('in colorPicker');
    //L.DomEvent.disableClickPropagation(divRef?.current);
    //L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  const DragHandleFC: React.FC = (props) => {
    return (
      <>
        <DragHandle />
      </>
    );
  };

  const DragHandle = SortableHandle(() => (
    <ListItemIcon>
      <DragHandleIcon />
    </ListItemIcon>
  ));

  const SortableParentLayerFC: React.FC<any> = ({ parent }: any) => {
    const divRef = React.useRef();
    /* Only for ReactLeaflet */
    React.useEffect(() => {
      if (divRef && divRef !== undefined) {
        if (divRef.current && divRef.current !== undefined && divRef.current !== null) {
          //    console.log('ref from hook');
          //    console.dir(divRef);
          //    console.dir(divRef.current);
          L.DomEvent.disableClickPropagation(divRef?.current);
          L.DomEvent.disableScrollPropagation(divRef?.current);
        }
      }
    });
    return (
      <>
        <SortableParentLayer key={parent.id} index={parent.order} parent={parent} aRef={divRef} />
      </>
    );
  };

  const blockAnything = (e) => {
    console.log('blocking click');
    console.dir(e);
    switch (e.detail) {
      case 1:
        console.log('single click');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 2:
        console.log('double click');
        e.preventDefault();
        e.stopPropagation();
        break;
      case 3:
        console.log('wtf');
        e.preventDefault();
        e.stopPropagation();
        break;
      default:
        console.log('extra wtf');
    }
  };

  const SortableParentLayer = SortableElement(({ parent, aRef }: any) => {
    // console.log('ref:');
    // console.dir(aRef);
    const onParentLayerAccordionChange = (event: any, expanded: any) => {
      updateParent((parent as any).id, { expanded: expanded });
    };
    return (
      <ListItem ContainerComponent="div">
        {/*<Grid container>
                    {/*<Grid item>*/}
        <Accordion expanded={parent.expanded} onChange={onParentLayerAccordionChange} className={classes.accordion}>
          <Grid container justify="flex-start" alignItems="center">
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
            <Grid item xs={5}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.heading} id={parent.id}>
                {parent.id}
              </AccordionSummary>
            </Grid>
            <Grid item xs={3}>
              <ColorPicker
                name="color"
                defaultValue={parent.colorCode}
                ref={colorRef}
                onChange={(color: any) => {
                  updateParent(parent.id, { colorCode: color });
                }}
              />
            </Grid>
            <Grid item xs={2} className={classes.spinnerGridItem} style={{ position: 'relative' }}>
              <CircularProgress variant="determinate" value={parent.loaded} />
            </Grid>
          </Grid>
          {parent.children.map((child: any) => (
            <Grid container direction="row" justify="flex-start" alignItems="center">
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
              <Grid item xs={2}>
                <ColorPicker
                  name="color"
                  defaultValue={child.colorCode}
                  onChange={(color: any) =>
                    updateChild(parent.id, child.id, {
                      colorCode: color
                    })
                  }
                />
              </Grid>
              <Grid item xs={2} style={{ position: 'relative' }}>
                <CircularProgress variant="determinate" value={child.loaded} />
              </Grid>
            </Grid>
          ))}
        </Accordion>
        {/*</Grid>
                    {/*<Grid item xs={2}>*/}
        <ListItemSecondaryAction>
          {/*<div ref={aRef}>*/}
          <div onClick={blockAnything} onDoubleClick={blockAnything} onScroll={blockAnything}>
            <DragHandle />
          </div>

          <div
            onClick={blockAnything}
            onDoubleClick={blockAnything}
            onScroll={blockAnything}
            style={{ width: 100, height: 100, background: 'blue' }}></div>
          {/* <DragHandle />*/}
        </ListItemSecondaryAction>
        {/*</Grid>
                </Grid>*/}
      </ListItem>
    );
  });

  const SortableListContainer = SortableContainer(({ items }: any) => (
    <List>
      {items.map((parent: { id: string; order: number }) => (
        <SortableParentLayerFC key={parent.id} index={parent.order} parent={parent} />
      ))}
    </List>
  ));

  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    const returnVal = sortObject(objectState, oldIndex, newIndex);
    setObjectState(returnVal);
  };

  return (
    <div className={classes.root}>
      <SortableListContainer items={sortArray(objectState)} onSortEnd={onSortEnd} useDragHandle={true} lockAxis="y" />

      {/*<br />*/}

      {/*<pre>{JSON.stringify(sortArray(objectState), null, 2)}</pre>*/}
    </div>
  );
}
