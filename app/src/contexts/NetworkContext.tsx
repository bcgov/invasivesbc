import { Capacitor } from '@capacitor/core';
import React from 'react';

interface INetworkContext {
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
}
export const NetworkContext = React.createContext<INetworkContext>({
  connected: true,
  setConnected: () => {}
});

export const NetworkContextProvider: React.FC = (props) => {
  const [connected, setConnected] = React.useState(Capacitor.getPlatform() !== 'web' ? false : true);

  return <NetworkContext.Provider value={{ connected, setConnected }}>{props.children}</NetworkContext.Provider>;
};
