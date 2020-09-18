import React from 'react';
import { AppBar } from '@material-ui/core';
import './AppNavBar.scss';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';

/**
 * Nav bar with with role-based functionality.
 */
function AppNavBar() {
  const keycloak = useKeycloakWrapper();
  const displayName = keycloak.displayName || keycloak.firstName || 'default';

  return <AppBar className="map-nav">{displayName}</AppBar>;
}

export default AppNavBar;
