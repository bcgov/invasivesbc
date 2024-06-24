import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { USERINFO_CLEAR_REQUEST, USERINFO_LOAD_COMPLETE } from '../actions';

interface UserInfo {
  loaded: boolean;
  activated: boolean;
  accessRequested: boolean;
}

function createUserInfoReducer(userInfo: UserInfo) {
  const initialState: UserInfo = {
    ...userInfo
  };

  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<UserInfo>) => {
      switch (action.type) {
        case USERINFO_CLEAR_REQUEST:
          draftState.loaded = false;
          draftState.activated = false;
          draftState.accessRequested = false;
          break;
        case USERINFO_LOAD_COMPLETE:
          draftState.loaded = true;
          draftState.activated = action.payload.userInfo.activation_status === 1;
          break;
        default:
          break;
      }
    });
  };
}

const selectUserInfo: (state) => UserInfo = (state) => state.UserInfo;

export { selectUserInfo, createUserInfoReducer };
