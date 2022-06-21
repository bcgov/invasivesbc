import React, {PropsWithChildren, ReactNode} from 'react';
import {useSelector} from "../../state/utilities/use_selector";
import {selectConfiguration} from "../../state/reducers/configuration";


const WebOnly = ({children}: PropsWithChildren<any>) => {
  const {MOBILE} = useSelector(selectConfiguration);

  if (!MOBILE) {
    return children;
  }

  return null;
};

export {WebOnly}
