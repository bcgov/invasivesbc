// error handler wants persistor so it can purge() on demand
import React from 'react';
import { Persistor } from 'redux-persist/es/types';

export const PersistorContext = React.createContext<Persistor | null>(null);
