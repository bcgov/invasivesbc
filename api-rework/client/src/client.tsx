import React, { createContext, useEffect, useReducer } from 'react';
import ActivitiesList from 'activities/list';
import { BrowserRouter, Route, Routes } from 'react-router';
import ActivitiesDetail from 'activities/detail';
import Keycloak from 'keycloak-js';
import { produce } from 'immer';

const MIN_FRESHNESS = 60;

const keycloakInstance = new Keycloak({
  clientId: 'invasives-bc-4565',
  realm: 'standard',
  url: 'https://dev.loginproxy.gov.bc.ca/auth/'
});

type AuthState = {
  authenticated: boolean;
  initialized: boolean;
  authentication_in_process: boolean;
  token: string | null;
  user_details: {
    family_name: string;
    given_name: string;
    identity_provider: string;
  } | null;
};

const AuthContext = createContext<{ state: AuthState; dispatch: React.ActionDispatch<any> }>({
  state: {
    authenticated: false,
    initialized: false,
    authentication_in_process: false,
    token: null,
    user_details: null
  },
  dispatch: () => {
    console.error('context was not properly initialized');
  }
});

const Client: React.FC = () => {
  const [auth, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'initialized':
          return produce(state, (draft) => {
            draft.initialized = true;
            draft.authenticated = action.payload;
            draft.token = keycloakInstance.idToken || null;
            if (keycloakInstance.idTokenParsed) {
              draft.user_details = {
                identity_provider: keycloakInstance.idTokenParsed.identity_provider,
                family_name: keycloakInstance.idTokenParsed.family_name,
                given_name: keycloakInstance.idTokenParsed.given_name
              };
            }
          });
        case 'authentication_complete':
          return produce(state, (draft) => {
            draft.authenticated = keycloakInstance.authenticated;
            draft.authentication_in_process = false;
            draft.token = keycloakInstance.idToken || null;
            if (keycloakInstance.idTokenParsed) {
              draft.user_details = {
                identity_provider: keycloakInstance.idTokenParsed.identity_provider,
                family_name: keycloakInstance.idTokenParsed.family_name,
                given_name: keycloakInstance.idTokenParsed.given_name
              };
            }
          });
        case 'logged_out':
          return produce(state, (draft) => {
            draft.token = null;
            draft.authenticated = false;
            draft.authentication_in_process = false;
            draft.user_details = null;
          });
        case 'do_authentication':
          keycloakInstance.login().then((kcr) => {
            dispatch({ type: 'authentication_complete', payload: kcr });
          });
          return produce(state, (draft) => {
            draft.authenticated = false;
            draft.authentication_in_process = true;
          });
        case 'do_logout':
          keycloakInstance.logout().then(() => {
            dispatch({ type: 'logged_out' });
          });
          return state;
        case 'update_stored_token':
          return produce(state, (draft) => {
            draft.token = keycloakInstance.idToken || null;
            if (keycloakInstance.idTokenParsed) {
              draft.user_details = {
                identity_provider: keycloakInstance.idTokenParsed.identity_provider,
                family_name: keycloakInstance.idTokenParsed.family_name,
                given_name: keycloakInstance.idTokenParsed.given_name
              };
            }
          });
        case 'keep_token_fresh':
          if (keycloakInstance.authenticated) {
            if (keycloakInstance.isTokenExpired(MIN_FRESHNESS)) {
              keycloakInstance.updateToken(MIN_FRESHNESS).then(() => dispatch({ type: 'update_stored_token' }));
            }
          } else {
            dispatch({ type: 'logged_out' });
          }

          return state;
        default:
          return state;
      }
    },
    {
      initialized: false,
      authenticated: false,
      authentication_in_process: false,
      token: null,
      user_details: null
    } as AuthState
  );

  useEffect(() => {
    keycloakInstance
      .init({
        adapter: 'default',
        checkLoginIframe: false,
        redirectUri: 'http://localhost:3001',
        responseMode: 'fragment',
        onLoad: 'check-sso',
        pkceMethod: 'S256'
      })
      .then((auth) => {
        console.log('Keycloak is initialized');
        dispatch({ type: 'initialized', payload: auth });
      });
  }, []);

  useEffect(() => {
    /* check every 5 seconds to see if we are going to expire */
    const id = setInterval(() => {
      console.log('freshness check');
      dispatch({ type: 'keep_token_fresh' });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (!auth.initialized) {
    return <p>initializing</p>;
  }

  if (!auth.authenticated) {
    return (
      <>
        <p>Please authenticate to proceed</p>
        <button onClick={() => dispatch({ type: 'do_authentication' })}>Authenticate</button>
      </>
    );
  }
  return (
    <AuthContext
      value={{
        state: auth,
        dispatch: dispatch
      }}>
      <pre>
        Welcome, {auth.user_details?.given_name} [{keycloakInstance.idTokenParsed?.sub}] [
        {keycloakInstance.idTokenParsed?.aud}]
      </pre>
      <button onClick={() => dispatch({ type: 'do_logout' })}>Logout</button>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ActivitiesList />} />
          <Route path="/activities" element={<ActivitiesList />} />
          <Route path="/activities/:id" element={<ActivitiesDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthContext>
  );
};

export { AuthContext };
export default Client;
