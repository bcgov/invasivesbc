import React from 'react';
import { InvasivesMap } from 'UI/LegacyMap/InvasivesMap';

const MapContext = React.createContext<InvasivesMap | undefined>(undefined);

export { MapContext };
