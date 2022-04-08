import { ListItem, ListItemIcon, ListItemText, ListItemButton, Typography } from '@mui/material';
import React, { useRef } from 'react';
import ruler from '../../../Icons/ruler.png';
import { toolStyles } from '../../Helpers/ToolStyles';

const MeasureTool = (props: any) => {
  const toolClass = toolStyles();
  const divRef = useRef(null);

  const handleClick = (event) => {
    props.setMeasureToolContainerOpen((prev) => !prev);
  };

  return (
    <ListItem disableGutters className={toolClass.listItem}>
      <ListItemButton ref={divRef} onClick={handleClick}>
        <ListItemIcon>
          <img alt={Math.random().toString()} className={toolClass.toolImg} src={ruler} />
        </ListItemIcon>
        <ListItemText>
          <Typography className={toolClass.Font}>Measure</Typography>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
};

export default MeasureTool;
