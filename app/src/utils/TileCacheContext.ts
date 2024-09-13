import React from 'react';
import { TileCacheService } from 'UI/Map2/helpers/tile-cache';

export const TileCacheContext = React.createContext<TileCacheService | null>(null);
