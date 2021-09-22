import * as React from 'react';
import useKeycloakWrapper from '../hooks/useKeycloakWrapper';
import { useInvasivesApi } from '../hooks/useInvasivesApi';
import { DatabaseContext2, upsert, UpsertType } from './DatabaseContext2';
import { DocType } from '../constants/database';
import { Capacitor } from '@capacitor/core';

export interface IAuthState {
  ready?: boolean;
}

export const AuthStateContext = React.createContext<IAuthState>({
  ready: false
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloak = useKeycloakWrapper();
  const invasivesApi = useInvasivesApi();

  const [userInfo, setUserInfo] = React.useState<any>(null);
  const databaseContext = React.useContext(DatabaseContext2);

  React.useEffect(() => {
    const loadUserInfo = async () => {
      console.log(keycloak.obj + 'keycloak is here');
      const user = await keycloak.obj?.loadUserInfo();
      if (Capacitor.getPlatform() !== 'web' && databaseContext.ready) {
        await upsert(
          [
            {
              type: UpsertType.DOC_TYPE_AND_ID_SLOW_JSON_PATCH,
              docType: DocType.KEYCLOAK,
              ID: '1',
              json: user
            }
          ],
          databaseContext
        );
      }
      setUserInfo(user);
    };

    loadUserInfo();
  }, [keycloak.obj]);

  React.useEffect(() => {
    const getApiSpec = async () => {
      await invasivesApi.getCachedApiSpec();
    };

    getApiSpec();
  }, []);

  return (
    <AuthStateContext.Provider value={{ ready: keycloak.obj?.authenticated && !!userInfo }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
