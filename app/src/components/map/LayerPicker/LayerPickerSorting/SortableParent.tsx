import React, { useContext } from 'react';
import { Accordion, AccordionSummary, List, ListItem, Grid, Typography, ListItemIcon } from '@material-ui/core';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
/* HelperFiles */
import {
  sortArray,
  getObjectsBeforeIndex,
  getObjectsAfterIndex,
  getParentIndex,
  getParent,
  sortObject
} from './SortLayerOrder';
import { SortableChild } from './SortableChild';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { getParentAction, updateParentAction } from '../LayersActionsHelper/LayersActionsFunctions';
import KMLUpload from 'components/map-buddy-components/KMLUpload';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';

export const updateParent = (parentType: string, fieldsToUpdate: Object, objectState: any, setObjectState: any) => {
  let pIndex = getParentIndex(objectState, parentType);
  let parentsBefore: Object[] = getObjectsBeforeIndex(objectState, pIndex);
  let parentsAfter: Object[] = getObjectsAfterIndex(objectState, pIndex);
  const oldParent = getParent(objectState, parentType);
  const updatedParent = { ...oldParent, ...fieldsToUpdate };
  setObjectState([...parentsBefore, updatedParent, ...parentsAfter] as any);
};

export const SortableParent = (props: any) => {
  const mapLayersContext = useContext(MapRequestContext);
  const { layersSelected, setLayersSelected } = mapLayersContext;
  const { layersActions, setLayersActions } = mapLayersContext;
  /* Sortable List */

  const SortableParentLayer = SortableElement(({ parent }: any) => {
    const onParentLayerAccordionChange = (event: any, expanded: any) => {
      updateParentAction(layersActions, setLayersActions, parent.id, { expanded: expanded });
    };

    const DragHandle = SortableHandle(() => (
      <ListItemIcon>
        {getParentAction(layersActions, parent.id).expanded ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
      </ListItemIcon>
    ));

    return (
      <ListItem ContainerComponent="div" dense={true}>
        <Accordion
          id="parent-accordion"
          expanded={getParentAction(layersActions, parent.id).expanded}
          onChange={onParentLayerAccordionChange}
          style={{ width: '100%' }}>
          <Grid
            id="accordion-grid"
            container
            style={{ marginTop: -10, marginBottom: -10, width: 500 }}
            alignItems="center"
            xs={12}>
            <Grid id="accordion-summary" item xs={10}>
              <AccordionSummary>
                <Typography variant="subtitle1">{parent.name}</Typography>
              </AccordionSummary>
            </Grid>
            <Grid id="draghandle" item xs={2}>
              <DragHandle />
            </Grid>
          </Grid>
          {/* Children Array */}

          {parent.id === 'user_uploaded_layers' ? (
            <KMLUpload setGeo={props.setGeo} />
          ) : (
            <SortableChild parent={parent} />
          )}
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
  // objectsState
  const onSortEnd = ({ oldIndex, newIndex }: any) => {
    const returnVal = sortObject(sortArray(layersSelected), oldIndex, newIndex);
    setLayersSelected(sortArray(returnVal));
  };

  return (
    <SortableListContainer items={sortArray(layersSelected)} onSortEnd={onSortEnd} useDragHandle={true} lockAxis="y" />
  );
};
