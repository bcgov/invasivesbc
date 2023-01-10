import { Button, ClickAwayListener, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { toolStyles } from '../../Helpers/ToolStyles';

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

export const JumpToTrip = (props) => {
  // style
  const toolClass = toolStyles();

  // Is this needed? Copied from DisplayPosition
  const divRef = useRef(null);

  const [checked, setChecked] = useState<boolean>(false);

  const unCheck = () => {
    setChecked(false);
  }

  return (
    <ClickAwayListener onClickAway={unCheck}>
      <ListItem
        onClick={() => {
          setChecked(true);
        }}
        disableGutters>
        <ListItemText>
          <Typography className={toolClass.Font}>
            {props.name}
            {props.server_id && <span> (kml)</span>}
          </Typography>
        </ListItemText>
        <ListItemIcon>{checked && <CheckIcon />}</ListItemIcon>
        <ListItemIcon>
          <Button onClick={() => props.deleteBoundary(props.id, props.server_id)}>
            <DeleteIcon />
          </Button>
        </ListItemIcon>
      </ListItem>
    </ClickAwayListener>
  );
};

export default JumpToTrip;