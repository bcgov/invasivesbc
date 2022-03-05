import { ListItem } from '@mui/material';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import React, { useContext } from 'react';
import { SortableElement } from 'react-sortable-hoc';
import { ParentLayer } from '../Components/ParentLayer';
import { updateParentAction } from '../LayersActionsHelper/LayersActionsFunctions';

const SortableParentLayer = SortableElement(({ parent }) => {
  const mapLayersContext = useContext(MapRequestContext);
  const { layersActions, setLayersActions } = mapLayersContext;

  const onParentLayerAccordionChange = (event: any, expanded: any) => {
    updateParentAction(layersActions, setLayersActions, parent.id, { expanded: expanded });
  };

  return (
    <ListItem
      key={Math.random()}
      id={parent.id}
      dense={true}
      ContainerComponent="div"
      style={{ width: '100%', maxWidth: 440 }}>
      <ParentLayer parent={parent} onParentLayerAccordionChange={onParentLayerAccordionChange} />
    </ListItem>
  );
});

export default SortableParentLayer;
