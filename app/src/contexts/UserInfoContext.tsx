import * as React from 'react';
import useKeycloakWrapper, { IUserInfo } from '../hooks/useKeycloakWrapper';
import { useInvasivesApi } from '../hooks/useInvasivesApi';
import { DatabaseContext2, upsert, UpsertType } from './DatabaseContext2';
import { DocType } from '../constants/database';
import { Capacitor } from '@capacitor/core';
import { NetworkContext } from './NetworkContext';

export interface IUserInfoState {
  userInfo: IUserInfo;
  userInfoLoaded: boolean;
  setUserInfo: React.Dispatch<React.SetStateAction<Object>>;
  setUserInfoLoaded: React.Dispatch<React.SetStateAction<Boolean>>;
}

export const UserInfoContext = React.createContext<IUserInfoState>({
  userInfo: {
    username: '',
    email: '',
    groups: [],
    roles: []
  },
  userInfoLoaded: false,
  setUserInfo: () => {},
  setUserInfoLoaded: () => {}
});

export const UserInfoContextProvider: React.FC = (props) => {
  let infoLoaded = false;
  let info: IUserInfo = {
    username: '',
    email: '',
    groups: [],
    roles: []
  };
  const [userInfoLoaded, setUserInfoLoaded] = React.useState(infoLoaded);
  const [userInfo, setUserInfo] = React.useState(info);
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
