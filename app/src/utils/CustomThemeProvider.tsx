import { createTheme, ThemeOptions, ThemeProvider } from '@material-ui/core';
import { ThemeContext } from 'contexts/themeContext';
import React, { useContext } from 'react';
import appTheme from 'themes/appTheme';

const CustomThemeProvider: React.FC = (props) => {
  const muiThemeDark = createTheme({ ...appTheme, palette: { ...appTheme.palette, type: 'dark' } } as ThemeOptions);
  const muiThemeLight = createTheme(appTheme as ThemeOptions);
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;

  return <ThemeProvider theme={themeType ? muiThemeDark : muiThemeLight}>{props.children}</ThemeProvider>;
};

export default CustomThemeProvider;
