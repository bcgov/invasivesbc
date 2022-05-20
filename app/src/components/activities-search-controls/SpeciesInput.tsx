import TextField from '@mui/material/TextField';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TreeItem from '@mui/lab/TreeItem';
import TreeView from '@mui/lab/TreeView';
import React from 'react';

export const SpeciesTree = () => {
  const data = {
    id: 'root',
    name: 'All Species',
    children: [
      {
        id: '1',
        name: 'meats',
        children: [
          {
            id: '4',
            name: 'grazers'
          }
        ]
      },
      {
        id: '3',
        name: 'greens'
      }
    ]
  };

  const renderTree = (nodes: any) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children) ? nodes.children.map((node: any) => renderTree(node)) : null}
    </TreeItem>
  );

  return (
    <>
      <TextField label='Species' />
      <TreeView defaultCollapseIcon={<ExpandMore />} defaultExpandIcon={<ChevronRight />}>
        {renderTree(data)}
      </TreeView>
    </>
  );
};
export default SpeciesTree;
