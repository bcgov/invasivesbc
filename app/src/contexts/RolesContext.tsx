import * as React from 'react';

// export const ThemeContext = React.createContext();

interface IRolesContext {
  userRoles: string[];
}

export const RolesContext = React.createContext<IRolesContext>({
  userRoles: []
});

export const RolesContextProvider: React.FC = (props) => {
  const [userRoles] = React.useState([]);
  return <RolesContext.Provider value={{ userRoles }}>{props.children}</RolesContext.Provider>;
};
