import { PropsWithChildren } from 'react';
import { useSelector } from 'utils/use_selector';

const WebOnly = ({ children }: PropsWithChildren) => {
  const { MOBILE } = useSelector((state) => state.Configuration.current.build);

  if (!MOBILE) {
    return children;
  }

  return null;
};

export { WebOnly };
