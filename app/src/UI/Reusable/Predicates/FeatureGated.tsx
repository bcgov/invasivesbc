import { PropsWithChildren } from 'react';
import { useSelector } from 'utils/use_selector';
import { FeatureFlags } from 'state/configuration/feature-flags';

type FeatureGatedProps = {
  requires: keyof FeatureFlags;
} & PropsWithChildren;

const FeatureGated = ({ children, requires }: FeatureGatedProps) => {
  const { features } = useSelector((state) => state.Configuration.current);

  if (features[requires].enabled) {
    return children;
  }

  return null;
};

export { FeatureGated };
