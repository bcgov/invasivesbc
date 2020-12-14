import { Network, NetworkStatus } from '@capacitor/core';
import React, { useEffect, useState } from 'react';

export const NetworkContext = React.createContext<NetworkStatus>(null);

/**
 * Provides access to the database and to related functions to manipulate the database instance.
 *
 * @param {*} props
 */
export const NetworkContextProvider: React.FC = (props) => {
  const [networkContext, setNetworkContext] = useState<NetworkStatus>(null);

  useEffect(() => {
    // Remove old listeners, if any
    Network.removeAllListeners();

    // Add new listener
    Network.addListener('networkStatusChange', (status) => {
      setNetworkContext(status);
    });

    return () => {
      Network.removeAllListeners();
    };
  }, [Network]);

  return <NetworkContext.Provider value={networkContext}>{props.children}</NetworkContext.Provider>;
};
