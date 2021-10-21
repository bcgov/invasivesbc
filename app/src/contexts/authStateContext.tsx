import * as React from 'react';
import useKeycloakWrapper from '../hooks/useKeycloakWrapper';
import { useInvasivesApi } from '../hooks/useInvasivesApi';
import { DatabaseContext2, upsert, UpsertType } from './DatabaseContext2';
import { DocType } from '../constants/database';
import { Capacitor } from '@capacitor/core';

export interface IAuthState {
  ready?: boolean;
  keycloak?: any;
}

export const AuthStateContext = React.createContext<IAuthState>({
  ready: false,
  keycloak: {}
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloak = useKeycloakWrapper();
  const invasivesApi = useInvasivesApi();

  React.useEffect(() => {
    const getApiSpec = async () => {
      await invasivesApi.getCachedApiSpec();
    };

    getApiSpec();
  }, []);

  return <AuthStateContext.Provider value={{ keycloak: keycloak }}>{props.children}</AuthStateContext.Provider>;
};
