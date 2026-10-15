import { IconButton } from '@mui/material';
import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import LayoutSwitch from 'UI/Layout/DebugMenu/LayoutSwitch';
import { Debug } from 'UI/Reusable/Predicates/Debug';
import { BugReport } from '@mui/icons-material';
import { bcYellow } from 'constants/colors';
import { Platform } from 'state/configuration/build-time-config';
import { AndroidMemoryReport } from 'UI/Layout/DebugMenu/AndroidMemoryReport';
import { PlatformGated } from 'UI/Reusable/Predicates/PlatformGated';
import ClearAppCache from './ClearAppCache';
import PlotClientBoundary from './PlotClientBoundary';
import { useNavigate } from 'react-router';
import './DebugMenu.css';

const DebugMenu = () => {
  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => setNavValue(evt.target.value);

  const handleEnter = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.code === 'Enter') {
      navigate(navValue);
      setNavValue('');
    }
  };
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [navValue, setNavValue] = useState<string>('');
  const navigate = useNavigate();

  return (
    <Debug>
      <IconButton className="debug-button" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <BugReport sx={{ color: bcYellow }} />
      </IconButton>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <div id={'debug-panel'}>
          <input
            type="text"
            className="debug-nav"
            placeholder="Navigation Path"
            onKeyDown={handleEnter}
            onChange={handleChange}
            value={navValue}
          />
          <LayoutSwitch />

          <PlatformGated requires={Platform.ANDROID}>
            <AndroidMemoryReport />
          </PlatformGated>
          <ClearAppCache />
          <PlotClientBoundary />
        </div>
      </CustomPopover>
    </Debug>
  );
};
export default DebugMenu;
