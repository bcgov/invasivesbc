import { SortableContainer } from 'react-sortable-hoc';
import React from 'react';
import { List } from '@mui/material';
import SortableParentLayer from './SortableParentLayer';

const SortableListContainer = SortableContainer(({ items }: any) => (
  <List>
    {items.map((parent: { id: string; order: number }) => (
      <SortableParentLayer key={'parent' + parent.id + Math.random()} index={parent.order} parent={parent} />
    ))}
  </List>
));

export default SortableListContainer;
