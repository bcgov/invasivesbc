import { createTheme, makeStyles, ThemeOptions } from '@material-ui/core';
import rjsfTheme from 'themes/rjsfTheme';

export const toolStyles = makeStyles((theme) => ({
  toolBtnLight: {
    height: 43,
    width: 43,
    zIndex: 1500,
    borderRadius: 4,
    background: 'white',
    '&:hover': {
      background: 'white'
    }
  },
  toolBtnDark: {
    height: 43,
    width: 43,
    zIndex: 1500,
    borderRadius: 4,
    background: '#424242',
    '&:hover': {
      background: '#424242'
    }
  },
  toolImg: {
    height: 24,
    width: 24
  }
}));
