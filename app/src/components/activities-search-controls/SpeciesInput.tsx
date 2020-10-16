import React from 'react';
import { TreeItem } from '@material-ui/lab';
import { TreeView } from '@material-ui/lab';

import Brightness1SharpIcon from '@material-ui/icons/Brightness1Sharp';
import Brightness2SharpIcon from '@material-ui/icons/Brightness2Sharp';
import Brightness3SharpIcon from '@material-ui/icons/Brightness3Sharp';
import { TextField } from '@material-ui/core';

export const SpeciesTree = () => {
  const data = {
    id: 'root',
    name: 'all the things',
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
      <TextField label="Species" />
      <TreeView
        defaultCollapseIcon={<Brightness1SharpIcon />}
        defaultExpandIcon={<Brightness2SharpIcon />}
        defaultEndIcon={<Brightness3SharpIcon />}>
        {renderTree(data)}
      </TreeView>
    </>
  );
};
export default SpeciesTree;
