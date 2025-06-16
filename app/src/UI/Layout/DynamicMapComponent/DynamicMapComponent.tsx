import React from 'react';
import { Map as LegacyMap } from 'UI/Features/LegacyMap/Map';
import { MainMap as ComponentizedMap } from 'UI/Features/ComponentizedMap/MainMap';
import { useSelector } from 'utils/use_selector';

const DynamicMapComponent = () => {
  const COMPONENTIZED_MAP = useSelector((state) => state.Configuration.current.features.MAP_MODE_COMPONENTIZED.enabled);
  const loggedInOrWorkingOffline = useSelector((state) => state.Auth.loggedInOrWorkingOffline);

  if (COMPONENTIZED_MAP && !loggedInOrWorkingOffline) {
    return <ComponentizedMap />;
  } else {
    return <LegacyMap />;
  }
};

export { DynamicMapComponent };
