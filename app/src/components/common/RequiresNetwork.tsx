import React, {PropsWithChildren, ReactElement, ReactNode, useContext, useEffect, useState} from 'react';
import { useSelector } from '../../state/utilities/use_selector';
import { selectConfiguration } from '../../state/reducers/configuration';
import { selectNetworkConnected } from '../../state/reducers/network';

interface RequiresNetworkProps extends PropsWithChildren<any> {
  networkRequirement?: 'connected' | 'disconnected' | 'either';
  offlineComponent?: ReactElement | null;
}

const RequiresNetwork = ({ children, networkRequirement = 'connected', offlineComponent = null}: RequiresNetworkProps) => {
  const connected = useSelector(selectNetworkConnected);
  const [networkPredicate, setNetworkPredicate] = useState(true);

  useEffect(() => {
    if (networkRequirement === 'connected' && !connected) {
      setNetworkPredicate(false);
      return;
    }
    if (networkRequirement === 'disconnected' && connected) {
      setNetworkPredicate(false);
      return;
    }
    setNetworkPredicate(true);
  }, [connected, networkRequirement]);

  if (networkPredicate) {
    return children;
  }

  // may be null, or some component (eg. a message)
  return offlineComponent;
};

export { RequiresNetwork };
