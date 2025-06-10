import { IconButton } from '@mui/material';
import React from 'react';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import LayoutSwitch from 'UI/Layout/DebugMenu/LayoutSwitch';
import { Debug } from 'UI/Reusable/Predicates/Debug';
import { BugReport } from '@mui/icons-material';
import { bcYellow } from 'constants/colors';
import './DebugMenu.css';

const DebugMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Debug>
      <IconButton className="debug-button" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <BugReport sx={{ color: bcYellow }} />
      </IconButton>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }} closeAfterPress={true}>
        <LayoutSwitch />
      </CustomPopover>
    </Debug>
  );
};
export default DebugMenu;
