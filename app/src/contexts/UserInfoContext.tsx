import * as React from 'react';
import useKeycloakWrapper, { IUserInfo } from '../hooks/useKeycloakWrapper';
import { useInvasivesApi } from '../hooks/useInvasivesApi';
import { DatabaseContext2, upsert, UpsertType } from './DatabaseContext2';
import { DocType } from '../constants/database';
import { Capacitor } from '@capacitor/core';
import { NetworkContext } from './NetworkContext';
import { useEffect } from 'react';

export const info: IUserInfo = {
  username: 'provider :)',
  email: '',
  groups: [],
  roles: []
};

export const infoLoaded: boolean = false;
export interface IUserInfoState {
  userInfo: IUserInfo;
  userInfoLoaded: boolean;
  setUserInfo: React.Dispatch<React.SetStateAction<Object>>;
  setUserInfoLoaded: React.Dispatch<React.SetStateAction<Boolean>>;
}

export const UserInfoContext = React.createContext<IUserInfoState>({
  userInfo: {
    username: 'no provider :(',
    email: '',
    groups: [],
    roles: []
  },
  userInfoLoaded: false,
  setUserInfo: () => {},
  setUserInfoLoaded: () => {}
});

export const UserInfoContextProvider: React.FC = (props) => {
  const [userInfoLoaded, setUserInfoLoaded] = React.useState(infoLoaded);
  const [userInfo, setUserInfo] = React.useState(info);
  const keycloak = useKeycloakWrapper();

  useEffect(() => {
    if (keycloak?.obj?.authenticated) {
      keycloak?.obj?.loadUserInfo().then((info) => {
        if (info) {
          setUserInfo(info);
          setUserInfoLoaded(true);
        }
      });
    }
  }, [keycloak?.obj?.authenticated]);

  return (
    <UserInfoContext.Provider
      value={{
        userInfo: userInfo,
        setUserInfo: setUserInfo,
        userInfoLoaded: userInfoLoaded,
        setUserInfoLoaded: setUserInfoLoaded
      }}>
      {props.children}
    </UserInfoContext.Provider>
  );
};
