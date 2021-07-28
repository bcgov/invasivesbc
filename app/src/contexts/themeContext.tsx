import * as React from 'react';

// export const ThemeContext = React.createContext();

interface IThemeContext {
  themeType: boolean;
  setThemeType: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ThemeContext = React.createContext<IThemeContext>({
  themeType: true,
  setThemeType: () => {}
});

export const ThemeContextProvider: React.FC = (props) => {
  const [themeType, setThemeType] = React.useState(false);

  return <ThemeContext.Provider value={{ themeType, setThemeType }}>{props.children}</ThemeContext.Provider>;
};
