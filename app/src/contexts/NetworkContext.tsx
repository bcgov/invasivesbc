import { Network, ConnectionStatus } from '@capacitor/network';
import React, { useEffect, useState } from 'react';

export const NetworkContext = React.createContext<ConnectionStatus>(null);

/**
 * Provides access to the database and to related functions to manipulate the database instance.
 *
 * @param {*} props
 */
export const NetworkContextProvider: React.FC = (props) => {
  const [networkContext, setNetworkContext] = useState<ConnectionStatus>(null);

  useEffect(() => {
    // Remove old listeners, if any
    Network.removeAllListeners();
    //grab on startup
    Network.getStatus().then((status) => {
      setNetworkContext(status);
    });

    // Add new listener
    Network.addListener('networkStatusChange', (status) => {
      setNetworkContext(status);
    });

    return () => {
      Network.removeAllListeners();
    };
  }, []);

  return <NetworkContext.Provider value={networkContext}>{props.children}</NetworkContext.Provider>;
};
