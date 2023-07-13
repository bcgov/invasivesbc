import { Action } from "redux";
import { SET_APP_MODE, TOGGLE_PANEL, URL_CHANGE } from "../actions";

export enum appModeEnum {
  "Records",
  "Record",
  "Landing",
  "Reports",
  "Batch",
  "IAPP",
}

const initialState: { mode?: appModeEnum; panelOpen: boolean, url: string | null} = {
  mode: appModeEnum.Landing,
  panelOpen: false,
  url: null
};

export default function appMode(state = initialState, action: any) {
  switch (action.type) {
    case SET_APP_MODE:
      return {
        ...state,
        mode: action.payload.mode
      }
    case TOGGLE_PANEL:
      return {
        ...state,
        panelOpen: !state.panelOpen,
      }
    case URL_CHANGE:
      return {
        ...state,
        url: action.payload.url
      }

    default:
      return state;
  }
}