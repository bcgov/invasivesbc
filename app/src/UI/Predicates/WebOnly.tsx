import { PropsWithChildren } from 'react';
import { MOBILE } from 'state/build-time-config';

const WebOnly = ({ children }: PropsWithChildren) => {
  if (!MOBILE) {
    return children;
  }

  return null;
};

export { WebOnly };
