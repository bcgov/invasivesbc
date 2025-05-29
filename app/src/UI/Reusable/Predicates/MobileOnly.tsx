import { PropsWithChildren, useEffect, useState } from 'react';
import { useSelector } from 'utils/use_selector';
import { selectNetworkConnected } from 'state/reducers/network';

interface MobileOnlyProps extends PropsWithChildren {
  networkRequirement?: 'connected' | 'disconnected' | 'either';
}

const MobileOnly = ({ children, networkRequirement = 'either' }: MobileOnlyProps) => {
  const connected = useSelector(selectNetworkConnected);
  const { MOBILE } = useSelector((state) => state.Configuration.current.build);

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
