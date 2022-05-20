import React, { PropsWithChildren, ReactNode, useContext, useEffect, useState } from 'react';
import { useSelector } from '../../state/utilities/use_selector';
import { selectConfiguration } from '../../state/reducers/configuration';
import { NetworkContext } from '../../contexts/NetworkContext';

interface MobileOnlyProps extends PropsWithChildren<any> {
  networkRequirement?: 'connected' | 'disconnected' | 'either';
}

const MobileOnly = ({ children, networkRequirement = 'either' }: MobileOnlyProps) => {
  const { MOBILE } = useSelector(selectConfiguration);
  const networkContext = useContext(NetworkContext);

  const [networkPredicate, setNetworkPredicate] = useState(true);

  useEffect(() => {
    if (networkRequirement === 'connected' && !networkContext.connected) {
      setNetworkPredicate(false);
      return;
    }
    if (networkRequirement === 'disconnected' && networkContext.connected) {
      setNetworkPredicate(false);
      return;
    }
    setNetworkPredicate(true);
  }, [networkContext.connected, networkRequirement]);

  if (MOBILE && networkPredicate) {
    return children;
  }

  return null;
};

export { MobileOnly };
