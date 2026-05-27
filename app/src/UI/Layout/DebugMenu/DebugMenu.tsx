import { IconButton } from '@mui/material';
import React from 'react';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import LayoutSwitch from 'UI/Layout/DebugMenu/LayoutSwitch';
import { Debug } from 'UI/Reusable/Predicates/Debug';
import { BugReport } from '@mui/icons-material';
import { bcYellow } from 'constants/colors';
import './DebugMenu.css';
import { Platform } from 'state/configuration/build-time-config';
import { AndroidMemoryReport } from 'UI/Layout/DebugMenu/AndroidMemoryReport';
import { PlatformGated } from 'UI/Reusable/Predicates/PlatformGated';
import ClearAppCache from './ClearAppCache';
import PlotClientBoundary from './PlotClientBoundary';
import OfflineProtomaps from 'UI/Layout/DebugMenu/OfflineProtomaps';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';
import { useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';

const DebugMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const api = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);
  const initDownload = async () => {
    const response = await fetch(`${api}/recordset/experiment`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filterObjects: [
          {
            selectColumns: ['activity_id'],
            tableFilters: [
              // {
              //   id: '123',
              //   field: 'activity_subtype',
              //   filterType: 'tableFilter',
              //   operator: 'CONTAINS',
              //   operator2: 'AND',
              //   filter: 'Release Monitoring'
              // }
            ],
            limit: 999999
          }
        ]
      })
    });
    if (response.body) {
      let last = Date.now();
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim() === '') continue;

          try {
            const parsedObject = JSON.parse(line);
            const now = Date.now();
            const time = ((now - last) / 1000).toFixed(2);
            last = now;
            console.log(`Received object in ${time}s:`, parsedObject);
          } catch (err) {
            console.error('Error parsing JSON line:', err);
          }
        }
      }
      console.log('Completed.');
    }
  };
  return (
    <Debug>
      <IconButton className="debug-button" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <BugReport sx={{ color: bcYellow }} />
      </IconButton>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }} closeAfterPress={true}>
        <div id={'debug-panel'}>
          <LayoutSwitch />

          <PlatformGated requires={Platform.ANDROID}>
            <AndroidMemoryReport />
          </PlatformGated>
          <ClearAppCache />
          <PlotClientBoundary />
          <FeatureGated requires="OFFLINE_PROTOMAPS">
            <OfflineProtomaps />
          </FeatureGated>
          <button onClick={initDownload}>Hello World</button>
        </div>
      </CustomPopover>
    </Debug>
  );
};
export default DebugMenu;
