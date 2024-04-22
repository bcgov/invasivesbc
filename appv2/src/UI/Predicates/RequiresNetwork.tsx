import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useSelector } from 'util/use_selector';
import { selectNetworkConnected } from 'state/reducers/network';

interface RequiresNetworkProps extends PropsWithChildren<any> {
  networkRequirement?: 'connected' | 'disconnected' | 'either';
}

const RequiresNetwork = ({ children, networkRequirement = 'either' }: RequiresNetworkProps) => {
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

  return null;
};

export { RequiresNetwork };
