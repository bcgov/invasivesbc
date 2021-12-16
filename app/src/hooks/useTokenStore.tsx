interface ITokenStore {
  getTokens: () => Promise<SavedTokens | null>;
  saveTokens: (token: SavedTokens) => Promise<void>;
  clearTokens: () => Promise<void>;
}

interface SavedTokens {
  token?: string;
  refreshToken?: string;
  refreshTokenType?: string;
  idToken?: string;
}

export const useTokenStore: () => ITokenStore = () => {
  const getTokens = async () => {
    const tokens = window.localStorage.getItem('keycloak_tokens');
    if (tokens === null) {
      throw new Error('No token store is present');
    }
    return JSON.parse(tokens);
  };

  const saveTokens = async (tokens: SavedTokens) => {
    const currentTokenString = window.localStorage.getItem('keycloak_tokens');
    if (currentTokenString !== null) {
      const currentTokens: SavedTokens = JSON.parse(currentTokenString);

      const updatedTokens: SavedTokens = {
        idToken: tokens.idToken ?? currentTokens.idToken,
        token: tokens.token ?? currentTokens.token
      };

      // don't overwrite an offline token with a regular refresh token (but inverse is ok)
      if (updatedTokens.refreshTokenType === 'Offline' || currentTokens.refreshTokenType === 'Refresh') {
        updatedTokens.refreshToken = tokens.refreshToken;
        updatedTokens.refreshTokenType = tokens.refreshTokenType;
      } else {
        // copy the old values
        updatedTokens.refreshToken = currentTokens.refreshToken;
        updatedTokens.refreshTokenType = currentTokens.refreshTokenType;
      }
      window.localStorage.setItem('keycloak_tokens', JSON.stringify(updatedTokens));
    } else {
      window.localStorage.setItem('keycloak_tokens', JSON.stringify(tokens));
    }
  };

  const clearTokens = async () => {
    window.localStorage.removeItem('keycloak_tokens');
  };

  return {
    getTokens,
    saveTokens,
    clearTokens
  };
};
