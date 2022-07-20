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
    switch (action.type) {
      case USERINFO_CLEAR_REQUEST:
        return {
          ...state,
          loaded: false,
          activated: false,
          accessRequested: false
        };
      case USERINFO_LOAD_COMPLETE:
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
