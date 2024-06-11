import { createNextState } from '@reduxjs/toolkit';
import { OVERLAY_MENU_TOGGLE, SET_APP_MODE, TOGGLE_PANEL, URL_CHANGE } from '../actions';

export enum appModeEnum {
  'Records',
  'Record',
  'Landing',
  'Reports',
  'Batch',
  'IAPP'
}

interface AppModeState {
  mode: appModeEnum;
  panelOpen: boolean;
  panelFullScreen: boolean;
  overlay_menu_toggle: boolean;
  url: string | null;
}

const initialState: AppModeState = {
  mode: appModeEnum.Landing,
  panelOpen: false,
  panelFullScreen: false,
  overlay_menu_toggle: false,
  url: null
};

export default function appMode(state = initialState, action: any): AppModeState {
  if (SET_APP_MODE.match(action)) {
    return {
      ...state,
      mode: action.payload.mode
    };
  }
  if (TOGGLE_PANEL.match(action)) {
    const panelStateInPayload = action?.payload?.panelOpen !== undefined ? true : false;
    return {
      ...state,
      panelOpen: panelStateInPayload ? action.payload.panelOpen : !state.panelOpen,
      panelFullScreen: action?.payload?.fullScreen ? action.payload.fullScreen : false
    };
  }
  if (OVERLAY_MENU_TOGGLE.match(action)) {
    return {
      ...state,
      overlay_menu_toggle: !state.overlay_menu_toggle
    };
  }
  if (URL_CHANGE.match(action)) {
    const nextState = createNextState(state, (draftState: any) => {
      draftState.url = action?.payload?.url;
      if (['Batch', 'Reports', 'Training', 'Legend', 'Landing', 'News'].includes(action.payload.url.split('/')[1])) {
        draftState.panelFullScreen = true;
      } else {
        draftState.panelFullScreen = false;
      }
      if (action.payload.url === '/') {
        draftState.panelOpen = false;
      } else {
        draftState.panelOpen = true;
      }
      draftState.overlay_menu_toggle = false;
    });
    return nextState;
  }

  return state;
}
