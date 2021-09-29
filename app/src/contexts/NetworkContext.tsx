import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface INetworkContext {
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
}
export const NetworkContext = React.createContext<INetworkContext>({
  connected: Capacitor.getPlatform() !== 'web' ? false : true,
  setConnected: () => {}
});

export const NetworkContextProvider: React.FC = (props) => {
  const [connected, setConnected] = React.useState(Capacitor.getPlatform() !== 'web' ? false : true);

  return <NetworkContext.Provider value={{ connected, setConnected }}>{props.children}</NetworkContext.Provider>;
};
