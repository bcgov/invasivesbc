import React, { useState } from 'react';

interface INetworkContext {
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
}
export const NetworkContext = React.createContext<INetworkContext>({
  connected: true,
  setConnected: () => {}
});

export const NetworkContextProvider: React.FC = (props) => {
  const [connected, setConnected] = React.useState(true);

  return <NetworkContext.Provider value={{ connected, setConnected }}>{props.children}</NetworkContext.Provider>;
};
