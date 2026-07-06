import React from 'react';
import { InvasivesMap } from 'UI/Features/LegacyMap/InvasivesMap';

const MapContext = React.createContext<InvasivesMap | null>(null);

export { MapContext };
