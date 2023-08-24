import { Action } from 'redux';
import {  OVERLAY_MENU_TOGGLE, SET_APP_MODE, TOGGLE_PANEL, URL_CHANGE } from '../actions';

export enum appModeEnum {
  'Records',
  'Record',
  'Landing',
  'Reports',
  'Batch',
  'IAPP'
}

const initialState: { mode?: appModeEnum; panelOpen: boolean; url: string | null, overlay_menu_toggle?: boolean } = {
  mode: appModeEnum.Landing,
  panelOpen: true,
  overlay_menu_toggle: false,
  url: null
};

export default function appMode(state = initialState, action: any) {
  switch (action.type) {
    case SET_APP_MODE:
      return {
        ...state,
        mode: action.payload.mode
      };
    case TOGGLE_PANEL:
      return {
        ...state,
        panelOpen: action?.payload?.panelOpen ? action.payload.panelOpen : !state.panelOpen,
        panelFullScreen: action?.payload?.fullScreen ? action.payload.fullScreen : false
      };
    case OVERLAY_MENU_TOGGLE: {
      return {
        ...state, 
        overlay_menu_toggle: !state.overlay_menu_toggle
      }
    }
    case URL_CHANGE:
      return {
        ...state,
        url: action.payload.url
      };

    default:
      return state;
  }
}
