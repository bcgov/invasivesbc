import React from 'react';
import NetworkActions from 'state/actions/network/NetworkActions';
import { useDispatch, useSelector } from 'utils/use_selector';
import { FormControl, FormControlLabel, Grow, Switch } from '@mui/material';
import { SignalWifi4Bar, SignalWifiOff } from '@mui/icons-material';

const NetworkStateControl: React.FC = () => {
  const handleNetworkStateChange = () => {
    dispatch(connected ? NetworkActions.setAdministrativeStatus(false) : NetworkActions.manualReconnect());
  };
  const connected = useSelector((state) => state.Network.connected);
  const dispatch = useDispatch();
  return (
    <div className={'network-state-control'}>
      <FormControl className="network-status-display">
        <FormControlLabel
          control={
            <Switch
              checked={connected}
              color={'primary'}
              size={'medium'}
              onChange={handleNetworkStateChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          }
          label={'Network'}
          labelPlacement="end"
        />
      </FormControl>
      <div className="network-status-display"></div>
      {connected && (
        <div className={'network-status-display'}>
          <Grow in={true} appear={true}>
            <SignalWifi4Bar fontSize={'medium'} aria-label={'Online'} />
          </Grow>
          <span className={'network-status-label'}>&nbsp;Online</span>
        </div>
      )}
      {connected || (
        <div className={'network-status-display'}>
          <Grow in={true} appear={true}>
            <SignalWifiOff fontSize={'medium'} aria-label={'Offline'} />
          </Grow>
          <span className={'network-status-label'}>Offline</span>
        </div>
      )}
    </div>
  );
};
export { NetworkStateControl };
