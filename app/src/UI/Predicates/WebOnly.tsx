import React, { PropsWithChildren } from 'react';
import { useSelector } from 'utils/use_selector';
import { selectConfiguration } from 'state/reducers/configuration';

const WebOnly = ({ children }: PropsWithChildren<any>) => {
  const { MOBILE } = useSelector(selectConfiguration);

  if (!MOBILE) {
    return children;
  }

  return null;
};

export { WebOnly };
