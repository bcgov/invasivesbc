import { DARK_THEME_ENABLED, DARK_THEME_DISABLED } from 'state/actions';

interface DarkTheme {
  darktheme: boolean;
}

function createDarkThemeReducer(initialStatus: DarkTheme) {
  const initialState: DarkTheme = {
    ...initialStatus
  };

  return (state = initialState, action) => {
    switch (action.type) {
      case DARK_THEME_ENABLED: {
        return {
          ...state,
          darktheme: true
        };
      }
      case DARK_THEME_DISABLED: {
        return {
          ...state,
          darktheme: false
        };
      }
      default:
        return state;
    }
  };
}

const selectDarkTheme: (state) => boolean = (state) => state.DarkTheme.darktheme;

export { selectDarkTheme, createDarkThemeReducer };
