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
    return state;
  };
}

const selectUserInfo = (state) => state.UserInfo;

export { selectUserInfo, createUserInfoReducer };
