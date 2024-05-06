import { OVERLAY_MENU_TOGGLE, SET_APP_MODE, TOGGLE_PANEL, URL_CHANGE } from '../actions';
import { createNextState } from '@reduxjs/toolkit';

export enum appModeEnum {
  'Records',
  'Record',
  'Landing',
  'Reports',
  'Batch',
  'IAPP'
}

const initialState: { mode?: appModeEnum; panelOpen: boolean; url: string | null; overlay_menu_toggle?: boolean } = {
  mode: appModeEnum.Landing,
  panelOpen: false,
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
      const panelStateInPayload = action?.payload?.panelOpen !== undefined ? true: false;
      return {
        ...state,
        panelOpen: panelStateInPayload? action.payload.panelOpen : !state.panelOpen,
        panelFullScreen: action?.payload?.fullScreen ? action.payload.fullScreen : false
      };
    case OVERLAY_MENU_TOGGLE: {
      return {
        ...state,
        overlay_menu_toggle : !state.overlay_menu_toggle
      };
    }
    case URL_CHANGE:
      const nextState = createNextState(state, (draftState: any) => {
        draftState.url = action?.payload?.url;
        if (['Batch', 'Reports', 'Training', 'Legend', 'Landing'].includes(action.payload.url.split('/')[1])) {
          draftState.panelFullScreen = true;
        }
        else
        {
          draftState.panelFullScreen = false;
        }
        if(action.payload.url === '/'){
          draftState.panelOpen = false;
        }
        else
        {
          draftState.panelOpen = true;
        }
        draftState.overlay_menu_toggle = false
      });
      return nextState;
    default:
      return state;
  }
}
