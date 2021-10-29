import * as React from 'react';
import useKeycloakWrapper, { IUserInfo } from '../hooks/useKeycloakWrapper';
import { useInvasivesApi } from '../hooks/useInvasivesApi';
import { DatabaseContext2, upsert, UpsertType } from './DatabaseContext2';
import { DocType } from '../constants/database';
import { Capacitor } from '@capacitor/core';
import { NetworkContext } from './NetworkContext';
import { useEffect } from 'react';

export const info: IUserInfo = {
  username: '',
  email: '',
  groups: [],
  roles: []
};

export const infoLoaded: boolean = false;
export interface IUserInfoState {
  userInfo: IUserInfo;
  userInfoLoaded: boolean;
  userRoles: any[];
  setUserInfo: React.Dispatch<React.SetStateAction<Object>>;
  setUserInfoLoaded: React.Dispatch<React.SetStateAction<Boolean>>;
  setUserRoles: React.Dispatch<React.SetStateAction<any>>;
}

export const UserInfoContext = React.createContext<IUserInfoState>({
  userInfo: {
    username: '',
    email: '',
    groups: [],
    roles: []
  },
  userInfoLoaded: false,
  userRoles: [],
  setUserInfo: () => {},
  setUserInfoLoaded: () => {},
  setUserRoles: () => {}
});

export const UserInfoContextProvider: React.FC = (props) => {
  const [userInfoLoaded, setUserInfoLoaded] = React.useState(infoLoaded);
  const [userInfo, setUserInfo] = React.useState(info);
  const [userRoles, setUserRoles] = React.useState([]);
  const keycloak = useKeycloakWrapper();

  useEffect(() => {
    if (keycloak?.obj?.authenticated) {
      keycloak?.obj?.loadUserInfo().then((info) => {
        if (info) {
          setUserRoles(info?.roles);
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
        setUserInfoLoaded: setUserInfoLoaded,
        userRoles: userRoles,
        setUserRoles: setUserRoles
      }}>
      {props.children}
    </UserInfoContext.Provider>
  );
};
