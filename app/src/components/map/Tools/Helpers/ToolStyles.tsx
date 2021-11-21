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
    height: 44,
    width: 100,
    zIndex: 1500,
    text: 100,
    marginLeft: 9,
    borderRadius: 5,
    spacing: 'space-around',
    background: 'white',
    backgroundColor: 'white !important',
    '&:hover': {
      background: 'white'
    }
  },
  toolBtnDark: {
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
  toolBtnLightDisabled: {
    height: 44,
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
    height: '43px',
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
    height: '43px',
    //width: 43,
    zIndex: 1500
    //borderRadius: 4,
    // marginRight: 10,
    // background: 'white',
    // '&:hover': {
    //   background: 'white'
    // }
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

export const layerPickerStyles = makeStyles((theme) => ({
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
 * @param themeType if true in dark mode else in light mdoe
 * @returns class
 */
export const assignPointModeTheme = (mode: boolean, themeType: boolean) => {
  return mode && (themeType ? toolStyles().popupModeSelectedDark : toolStyles().popupModeSelectedLight);
};

/**
 * Specify theme for non selected mode text to be used in style
 * @param mode is true; mode = Point otherwise mode = Within Radius
 * @param themeType if true in dark mode else in light mdoe
 * @returns color style
 */
export const assignPtDefaultTheme = (mode: boolean, themeType: boolean) => {
  return { color: mode && (themeType ? '#fff' : 'rgba(0, 0, 0, 0.87)') };
};

/**
 * Specify theme for text to be used in style
 * @param themeType if true in dark mode else in light mdoe
 * @returns color style
 */
export const assignTextDefaultTheme = (themeType: boolean) => {
  return { color: themeType ? '#fff' : 'rgba(0, 0, 0, 0.87)' };
};
