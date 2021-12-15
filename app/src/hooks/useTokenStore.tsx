interface ITokenStore {
  getTokens: () => Promise<SavedTokens | null>;
  saveTokens: (token: SavedTokens) => Promise<void>;
  clearTokens: () => Promise<void>;
}

interface SavedTokens {
  token?: string;
  refreshToken?: string;
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
    const currentTokens = window.localStorage.getItem('keycloak_tokens');
    if (currentTokens !== null) {
      const parsed: SavedTokens = JSON.parse(currentTokens);
      // coalesce values

      window.localStorage.setItem(
        'keycloak_tokens',
        JSON.stringify({
          idToken: tokens.idToken ?? parsed.idToken,
          refreshToken: tokens.refreshToken ?? parsed.refreshToken,
          token: tokens.token ?? parsed.token
        })
      );
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
