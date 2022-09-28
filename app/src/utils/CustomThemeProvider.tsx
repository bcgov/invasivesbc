import { createTheme, PaletteMode, ThemeOptions, ThemeProvider } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';

interface IThemeContext {
  themeType: boolean;
  setThemeType: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ThemeContext = React.createContext<IThemeContext>({
  themeType: false,
  setThemeType: () => {}
});

const CustomThemeProvider: React.FC = (props) => {
  const [themeType, setThemeType] = React.useState(false);

  // Update the theme only if the mode changes
  // const theme = React.useMemo(() => createTheme(getDesignTokens(mode) as ThemeOptions), [mode]);
  // const theme = createTheme(getDesignTokens(darkmode) as ThemeOptions);

  return (
    <ThemeContext.Provider value={{ themeType, setThemeType }}>
      {/* <ThemeProvider theme={theme}>{props.children}</ThemeProvider> */}
    </ThemeContext.Provider>
  );
};

export const getDesignTokens = (mode: PaletteMode) => {
  return {
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // palette values for light mode
            common: {
              black: '#000',
              white: '#fff'
            },
            primary: {
              light: '#5469a4',
              main: '#223f75', // BC ID: corporate blue
              dark: '#001949',
              contrastText: '#ffffff'
            },
            secondary: {
              light: '#ffd95e',
              main: '#e3a82b', // BC ID: corporate gold
              dark: '#ad7900',
              contrastText: '#000000'
            },
            error: {
              light: '#e57373',
              main: '#f44336',
              dark: '#d32f2f',
              contrastText: '#ffffff'
            },
            warning: {
              light: '#ffb74d',
              main: '#ff9800',
              dark: '#f57c00',
              contrastText: '#000000'
            },
            info: {
              light: '#64b5f6',
              main: '#2196f3',
              dark: '#1976d2',
              contrastText: '#ffffff'
            },
            success: {
              light: '#81c784',
              main: '#4caf50',
              dark: '#388e3c',
              contrastText: '#ffffff'
            }
          }
        : {
            // palette values for dark mode
            common: {
              black: '#000',
              white: '#fff'
            },
            primary: {
              light: '#ffd95e',
              main: '#e3a82b', // BC ID: corporate gold
              dark: '#ad7900',
              contrastText: '#000000'
            },
            secondary: {
              light: '#ffd95e',
              main: '#e3a82b', // BC ID: corporate gold
              dark: '#ad7900',
              contrastText: '#000000'
            },
            error: {
              light: '#e57373',
              main: '#f44336',
              dark: '#d32f2f',
              contrastText: '#ffffff'
            },
            warning: {
              light: '#ffb74d',
              main: '#ff9800',
              dark: '#f57c00',
              contrastText: '#000000'
            },
            info: {
              light: '#64b5f6',
              main: '#2196f3',
              dark: '#1976d2',
              contrastText: '#ffffff'
            },
            success: {
              light: '#81c784',
              main: '#4caf50',
              dark: '#388e3c',
              contrastText: '#ffffff'
            }
          })
    },
    typography: {
      fontFamily: ['BCSans', '"Noto Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
      h1: {
        fontSize: '3rem'
      },
      h2: {
        fontSize: '2.5rem'
      },
      h3: {
        fontSize: '2rem'
      },
      h4: {
        fontSize: '1.5rem'
      },
      h5: {
        fontSize: '1.25rem'
      },
      h6: {
        fontSize: '1rem'
      }
    },
    spacing: 4,
    components: {
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            height: '60px !important',
            width: '60px !important',
            marginLeft: '-30px',
            marginTop: '-30px'
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          textColorPrimary: '#ffffff',
          textColorSecondary: '#ffffff',
          textColorInherit: '#ffffff'
        }
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: 'xl',
            margin: 'auto'
          }
        }
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '1rem',
            color: 'white',
            backgroundColor: '#223F75'
          }
        }
      }
    }
  };
};

export default CustomThemeProvider;
