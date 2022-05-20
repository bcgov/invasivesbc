import { Capacitor } from '@capacitor/core';
import React from 'react';
import {useSelector} from "../state/utilities/use_selector";
import {selectConfiguration} from "../state/reducers/configuration";

interface INetworkContext {
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
}
export const NetworkContext = React.createContext<INetworkContext>({
  connected: true,
  setConnected: () => {}
});

export const NetworkContextProvider: React.FC = (props) => {
  const { MOBILE } = useSelector(selectConfiguration);

  const [connected, setConnected] = React.useState(MOBILE);


  return <NetworkContext.Provider value={{ connected, setConnected }}>{props.children}</NetworkContext.Provider>;
};
