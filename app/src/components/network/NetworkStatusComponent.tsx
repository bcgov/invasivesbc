import { Box, Typography } from '@material-ui/core';
import { NetworkContext } from 'contexts/NetworkContext';
import React, { useContext, useEffect, useState } from 'react';

interface INetworkStatusComponentProps {
  classes?: any;
}

const NetworkStatusComponent: React.FC<INetworkStatusComponentProps> = (props) => {
  const networkContext = useContext(NetworkContext);

  const defaultConnectionStatusString = (!window['cordova'] && 'Online') || '';

  const [networkStatusString, setNetworkStatusString] = useState(defaultConnectionStatusString);

  useEffect(() => {
    if (!networkContext) {
      return;
    }

    const connectionStatus = (networkContext.connected && 'Online') || 'Offline';
    const connectionStatusString = `${connectionStatus} (type: ${networkContext.connectionType})`;

    setNetworkStatusString(connectionStatusString);
  }, [networkContext]);

  return (
    <Box p={1}>
      <Typography variant="h5">Network Status: {networkStatusString}</Typography>
    </Box>
  );
};

export default NetworkStatusComponent;
