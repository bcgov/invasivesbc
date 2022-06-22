import React, { PropsWithChildren, ReactNode, useContext, useEffect, useState } from 'react';
import { useSelector } from '../../state/utilities/use_selector';
import { selectConfiguration } from '../../state/reducers/configuration';
import { selectNetworkConnected } from '../../state/reducers/network';

interface MobileOnlyProps extends PropsWithChildren<any> {
  networkRequirement?: 'connected' | 'disconnected' | 'either';
}

const MobileOnly = ({ children, networkRequirement = 'either' }: MobileOnlyProps) => {
  const { MOBILE } = useSelector(selectConfiguration);
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

  if (MOBILE && networkPredicate) {
    return children;
  }

  return null;
};

export { MobileOnly };
