import * as React from 'react';
import useKeycloakWrapper from '../hooks/useKeycloakWrapper';
interface IRolesContext {
  userRoles: string[];
  setUserRoles: React.Dispatch<React.SetStateAction<Array<Object>>>;
}

export const RolesContext = React.createContext<IRolesContext>({
  userRoles: [],
  setUserRoles: () => {}
});

export const RolesContextProvider: React.FC = (props) => {
  const keycloak = useKeycloakWrapper();
  let roles: string[] = [];
  if (keycloak.roles) {
    roles = keycloak.roles;
  }
  const [userRoles, setUserRoles] = React.useState(roles);
  return <RolesContext.Provider value={{ userRoles, setUserRoles }}>{props.children}</RolesContext.Provider>;
};
