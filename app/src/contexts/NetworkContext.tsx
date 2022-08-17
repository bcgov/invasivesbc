import React from 'react';
import { useSelector } from 'react-redux';
import { selectConfiguration } from 'state/reducers/configuration';
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
  const [connected, setConnected] = React.useState(MOBILE ? false : true);

  return <NetworkContext.Provider value={{ connected, setConnected }}>{props.children}</NetworkContext.Provider>;
};
