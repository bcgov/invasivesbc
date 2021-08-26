import { makeStyles } from '@material-ui/core';

export const toolStyles = makeStyles((theme) => ({
  toolBtnsLoc: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    flexFlow: 'column wrap',
    height: '35vh'
  },
  toolBtnLight: {
    height: 43,
    width: 43,
    zIndex: 1500,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 5,
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
    marginRight: 10,
    marginBottom: 5,
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
