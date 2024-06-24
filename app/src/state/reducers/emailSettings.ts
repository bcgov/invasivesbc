import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import {
  EMAIL_SETTINGS_RETRIEVE_REQUEST,
  EMAIL_SETTINGS_RETRIEVE_REQUEST_SUCCESS,
  EMAIL_SETTINGS_UPDATE_FAILURE,
  EMAIL_SETTINGS_UPDATE_SUCCESS
} from 'state/actions';

interface EmailSettings {
  message: string | null;
  working: boolean;
  error: boolean;
  emailSettings: {
    enabled: boolean;
    id: number | null;
    authenticationURL: string | null;
    emailServiceURL: string | null;
    clientId: string | null;
    clientSecret: string | null;
  } | null;
}

function createEmailSettingsReducer() {
  const initialState: EmailSettings = {
    message: null,
    working: false,
    error: false,
    emailSettings: {
      enabled: false,
      id: null,
      authenticationURL: null,
      emailServiceURL: null,
      clientId: null,
      clientSecret: null
    }
  };

  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<EmailSettings>) => {
      switch (action.type) {
        case EMAIL_SETTINGS_RETRIEVE_REQUEST:
          draftState.working = true;
          draftState.error = false;
          draftState.message = null;
          draftState.emailSettings = null;
          break;
        case EMAIL_SETTINGS_RETRIEVE_REQUEST_SUCCESS:
        case EMAIL_SETTINGS_UPDATE_SUCCESS:
          draftState.working = false;
          draftState.error = false;
          draftState.message = action.payload.message || null;
          draftState.emailSettings = action.payload.emailSettings || null;
          break;
        case EMAIL_SETTINGS_UPDATE_FAILURE:
          draftState.working = false;
          draftState.error = true;
          draftState.message = action.payload.message || null;
          draftState.emailSettings = action.payload.emailSettings || null;
          break;
        default:
          break;
      }
    });
  };
}

const selectEmailSettings: (state) => EmailSettings = (state) => state.EmailSettings;

export { selectEmailSettings, createEmailSettingsReducer };
