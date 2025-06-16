import { PropsWithChildren } from 'react';
import { useSelector } from 'utils/use_selector';

const Debug = ({ children }: PropsWithChildren) => {
  const { DEBUG } = useSelector((state) => state.Configuration.current.build);

  if (DEBUG) {
    return children;
  }

  return null;
};

export { Debug };
