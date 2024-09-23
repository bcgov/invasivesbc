import React, { PropsWithChildren } from 'react';
import { MOBILE } from 'state/build-time-config';

const WebOnly = ({ children }: PropsWithChildren<any>) => {
  if (!MOBILE) {
    return children;
  }

  return null;
};

export { WebOnly };
