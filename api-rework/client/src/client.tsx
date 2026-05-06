import React, { createContext, useEffect, useReducer, useState } from 'react';
import ActivitiesList from 'activities/list';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router';
import ActivitiesDetail from 'activities/detail';
import Keycloak from 'keycloak-js';
import { produce } from 'immer';
import Header from 'common-components/header/Header';
import Footer from 'common-components/footer/Footer';
import Logo from 'common-components/logo/Logo';
import Map from 'map-components/map';
import './client.css';
import EndlessLoadingBar from 'common-components/endless-loading-bar/EndlessLoadingBar';
import { AgGridProvider } from 'ag-grid-react';
import { AllCommunityModule } from 'ag-grid-community';
import MigrationStatusList from 'activities/migration_list';

const MIN_FRESHNESS = 60;
const SESSION_STORE_PATH_KEY = 'post-auth-redirect-path';

const keycloakInstance = new Keycloak({
  clientId: import.meta.env.VITE_SSO_CLIENT_ID || 'invasives-bc-4565',
  realm: import.meta.env.VITE_SSO_REALM || 'standard',
  url: import.meta.env.VITE_SSO_URL || 'https://dev.loginproxy.gov.bc.ca/auth/'
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
    sub: string;
  } | null;
};

const AuthContext = createContext<{ state: AuthState }>({
  state: {
    authenticated: false,
    initialized: false,
    authentication_in_process: false,
    token: null,
    user_details: null
  }
});

const SavedRouteRestorer: React.FC<{ savedRoute: string | null }> = ({ savedRoute }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (savedRoute !== null) navigate(savedRoute);
  }, [savedRoute]);

  return null;
};

const Client: React.FC = () => {
  const [savedPath, setSavedPath] = useState<string | null>(null);

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
                given_name: keycloakInstance.idTokenParsed.given_name,
                sub: keycloakInstance.idTokenParsed.sub || 'unknown'
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
                given_name: keycloakInstance.idTokenParsed.given_name,
                sub: keycloakInstance.idTokenParsed.sub || 'unknown'
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
          sessionStorage.setItem(SESSION_STORE_PATH_KEY, window.location.pathname);
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
                given_name: keycloakInstance.idTokenParsed.given_name,
                sub: keycloakInstance.idTokenParsed.sub || 'unknown'
              };
            }
          });
        case 'keep_token_fresh':
          if (keycloakInstance.authenticated) {
            if (keycloakInstance.isTokenExpired(MIN_FRESHNESS)) {
              keycloakInstance.updateToken(MIN_FRESHNESS).then(() => dispatch({ type: 'update_stored_token' }));
            }
          } else {
            return produce(state, (draft) => {
              draft.token = null;
              draft.authenticated = false;
              draft.authentication_in_process = false;
              draft.user_details = null;
            });
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
    const restoredPath = sessionStorage.getItem(SESSION_STORE_PATH_KEY);
    if (!restoredPath) {
      sessionStorage.setItem(SESSION_STORE_PATH_KEY, window.location.pathname);
    }

    keycloakInstance
      .init({
        adapter: 'default',
        checkLoginIframe: false,
        redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI || 'http://localhost:3001',
        responseMode: 'fragment',
        onLoad: 'check-sso',
        pkceMethod: 'S256'
      })
      .then((auth) => {
        sessionStorage.removeItem(SESSION_STORE_PATH_KEY);
        dispatch({ type: 'initialized', payload: auth });
        setSavedPath(restoredPath);
      });
  }, []);

  const handleLogin = () => dispatch({ type: 'do_authentication' });
  const handleLogout = () => dispatch({ type: 'do_logout' });
  useEffect(() => {
    /* check every 5 seconds to see if we are going to expire */
    const id = setInterval(() => {
      dispatch({ type: 'keep_token_fresh' });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (!auth.initialized) {
    return <EndlessLoadingBar />;
  }

  if (!auth.authenticated) {
    return (
      <>
        <Header authenticated={auth.authenticated} handleLogout={handleLogout} handleLogin={handleLogin} />
        <div className="main">
          <div className="content landing">
            <p>
              Welcome to the staging area for the InvasivesBC Normalization work. In order to proceed, please
              authenticate using your IDIR
            </p>
            <p>
              If you arrived here searching for the official InvasivesBC application, please head to{' '}
              <a href="https://invasivesbc.gov.bc.ca/">https://invasivesbc.gov.bc.ca/</a>
            </p>
            <Logo className="logo" />
          </div>
        </div>
        <Footer />
      </>
    );
  }
  return (
    <AuthContext
      value={{
        state: auth
      }}
    >
      <BrowserRouter>
        <Header authenticated={auth.authenticated} handleLogout={handleLogout} handleLogin={handleLogin} />
        <div className="main">
          <pre>
            Welcome, {auth.user_details?.given_name} [{keycloakInstance.idTokenParsed?.sub}] [
            {keycloakInstance.idTokenParsed?.aud}]
          </pre>
          <AgGridProvider modules={[AllCommunityModule]}>
            <SavedRouteRestorer savedRoute={savedPath} />
            <Routes>
              <Route path="/" element={<ActivitiesList />} />
              <Route path="/migration-status" element={<MigrationStatusList />} />
              <Route path="/activities" element={<ActivitiesList />} />
              <Route path="/activities/:id/*" element={<ActivitiesDetail />} />
              <Route path="/map/*" element={<Map />} />
            </Routes>
          </AgGridProvider>
        </div>
      </BrowserRouter>
    </AuthContext>
  );
};

export { AuthContext };
export default Client;
