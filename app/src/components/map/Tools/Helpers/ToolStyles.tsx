import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const toolStyles = makeStyles((theme: Theme) => ({
  toolBtn: {
    width: 43,
    zIndex: 1500,
    padding: 0,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 5
  },
  listItem: {
    paddingTop: 0,
    paddingBottom: 0
  },
  toolBtnCircle: {
    width: 43,
    zIndex: 1500,
    marginRight: 10,
    marginBottom: 5
  },
  toolBtnsLoc: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    flexFlow: 'column wrap'
  },
  toolBtnLightDisabled: {
    width: 100,
    zIndex: 1500,
    text: 100,
    marginLeft: 9,
    borderRadius: 5,
    spacing: 'space-around',
    background: 'white !important',
    backgroundColor: 'white',
    '&:hover': {
      background: 'white !important'
    }
  },
  toolBtnDarkDisabled: {
    height: 44,
    width: 100,
    zIndex: 1500,
    marginLeft: 9,
    borderRadius: 5,
    background: '#424242',
    '&:hover': {
      background: '#424242'
    }
  },
  Font: {
    text: 80,
    padding: 10,
    alight: 'left'
  },
  toolBtnMultiStageMenu: {
    minWidth: '650px',
    flexWrap: 'nowrap',
    //width: 43,
    zIndex: 1500,
    //borderRadius: 4,
    marginRight: 10,
    position: 'relative',
    right: 0
    // background: 'white',
    // '&:hover': {
    //   background: 'white'
    // }
  },
  toolBtnMultiStageMenuItem: {
    zIndex: 1500
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
  },
  selected: {
    backgroundColor: '#2196f3',
    color: 'white'
  },
  notSelected: {
    backgroundColor: 'white',
    color: 'black'
  }
}));

export const layerPickerStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '360px',
    height: '360px',
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 1500,
    borderRadius: '4px',
    right: 60,
    top: 20,
    ['@media (max-width:800px)']: {
      top: 100
    }
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  },
  accordion: {
    width: '100%'
  },
  spinnerGridItem: {
    width: '50px'
  }
}));

/**
 * Specify theme for selected mode text and background to be used
 * in className
 * @param mode is true; mode = Point otherwise mode = Within Radius
 * @param darkTheme if true in dark mode else in light mdoe
 * @returns class
 */
export const assignPointModeTheme = (mode: boolean, darkTheme: boolean) => {
  return mode && darkTheme ? toolStyles().popupModeSelectedDark : toolStyles().popupModeSelectedLight;
};

/**
 * Specify theme for non selected mode text to be used in style
 * @param mode is true; mode = Point otherwise mode = Within Radius
 * @param darkTheme if true in dark mode else in light mdoe
 * @returns color style
 */
export const assignPtDefaultTheme = (mode: boolean, darkTheme: boolean) => {
  return { color: mode && (darkTheme ? '#fff' : 'rgba(0, 0, 0, 0.87)') };
};

/**
 * Specify theme for text to be used in style
 * @param darkTheme if true in dark mode else in light mdoe
 * @returns color style
 */
export const assignTextDefaultTheme = (darkTheme: boolean) => {
  return { color: darkTheme ? '#fff' : 'rgba(0, 0, 0, 0.87)' };
};

export const assignPaperBGTheme = (darkTheme: boolean) => {
  return { backgroundColor: darkTheme ? '#424242' : '#fff' };
};
