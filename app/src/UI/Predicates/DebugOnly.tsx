import React, { PropsWithChildren } from 'react';
import { useSelector } from 'utils/use_selector';
import { selectConfiguration } from 'state/reducers/configuration';

const DebugOnly = ({ children }: PropsWithChildren<any>) => {
  const { DEBUG } = useSelector(selectConfiguration);

  if (DEBUG) {
    return children;
  }

  return null;
};

export { DebugOnly };
