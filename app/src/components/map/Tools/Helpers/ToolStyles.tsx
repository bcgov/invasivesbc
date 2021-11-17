import { makeStyles } from '@material-ui/core';

export const toolStyles = makeStyles((theme) => ({
  toolBtn: {
    height: 43,
    width: 43,
    zIndex: 1500,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 5
  },
  toolBtnCircle: {
    height: 43,
    width: 43,
    zIndex: 1500,
    marginRight: 10,
    marginBottom: 5
  },
  toolBtnsLoc: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    flexFlow: 'column wrap',
    height: '40vh'
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
  },
  toolSlider: {
    width: 300,
    marginLeft: 10,
    paddingTop: 20,
    display: 'flex',
    flexDirection: 'row'
  },
  tooltipWidth: {
    maxWidth: 500
  },
  toolIconLight: {
    backgroundColor: 'white',
    borderRadius: '100%'
  },
  toolIconDark: {
    backgroundColor: '#424242',
    borderRadius: '100%'
  },
  popupModeSelectedDark: {
    padding: 3,
    backgroundColor: '#424242',
    color: '#2196f3',
    borderRadius: 5
  },
  popupModeSelectedLight: {
    padding: 3,
    color: '#223f75',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 5
  }
}));
