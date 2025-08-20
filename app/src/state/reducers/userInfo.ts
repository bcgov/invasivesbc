import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { AuthActions } from 'state/actions/auth/Auth';

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
      if (AuthActions.loadUserInfo.match(action)) {
        draftState.loaded = true;
        draftState.activated = action.payload.activation_status === 1;
      } else if (AuthActions.clearUserInfo.match(action)) {
        draftState.loaded = false;
        draftState.activated = false;
        draftState.accessRequested = false;
      }
    });
  };
}

const selectUserInfo: (state) => UserInfo = (state) => state.UserInfo;

export { selectUserInfo, createUserInfoReducer };
