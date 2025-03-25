import { createNextState } from '@reduxjs/toolkit';
import { SET_APP_MODE, TOGGLE_PANEL, URL_CHANGE } from '../actions';

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
  url: string | null;
}

const initialState: AppModeState = {
  mode: appModeEnum.Landing,
  panelOpen: false,
  panelFullScreen: false,
  url: null
};

export default function appMode(state = initialState, action: any): AppModeState {
  switch (action.type) {
    case SET_APP_MODE:
      return {
        ...state,
        mode: action.payload.mode
      };
    case TOGGLE_PANEL: {
      const panelStateInPayload = action?.payload?.panelOpen !== undefined ? true : false;
      return {
        ...state,
        panelOpen: panelStateInPayload ? action.payload.panelOpen : !state.panelOpen,
        panelFullScreen: action?.payload?.fullScreen ? action.payload.fullScreen : false
      };
    }
    case URL_CHANGE: {
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
      });
      return nextState;
    }
    default:
      return state;
  }
}
