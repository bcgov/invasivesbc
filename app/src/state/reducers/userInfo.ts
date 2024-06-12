import { USERINFO_CLEAR_REQUEST, USERINFO_LOAD_COMPLETE } from 'state/actions';

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
    if (USERINFO_CLEAR_REQUEST.match(action)) {
      return {
        ...state,
        loaded: false,
        activated: false,
        accessRequested: false
      };
    }
    if (USERINFO_LOAD_COMPLETE.match(action)) {
      return {
        ...state,
        loaded: true,
        activated: action.payload.userInfo.activation_status === 1
      };
    }
    return state;
  };
}

const selectUserInfo: (state) => UserInfo = (state) => state.UserInfo;

export { selectUserInfo, createUserInfoReducer };
