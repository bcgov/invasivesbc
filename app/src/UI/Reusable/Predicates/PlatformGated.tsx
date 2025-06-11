import { PropsWithChildren } from 'react';
import { useSelector } from 'utils/use_selector';
import { Platform } from 'state/configuration/build-time-config';

type FeatureGatedProps = {
  requires: Platform | Platform[];
} & PropsWithChildren;

const PlatformGated = ({ children, requires }: FeatureGatedProps) => {
  const { PLATFORM } = useSelector((state) => state.Configuration.current.build);

  if (Array.isArray(requires) && requires.includes(PLATFORM)) {
    return children;
  } else if (PLATFORM === requires) {
    return children;
  }

  return null;
};
export { PlatformGated };
