import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { EmailActions } from 'state/actions/email/emailActions';

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
      if (EmailActions.retrieveReq.match(action)) {
        draftState.working = true;
        draftState.error = false;
        draftState.message = null;
        draftState.emailSettings = null;
      } else if (EmailActions.retrieveReqSuccess.match(action) || EmailActions.updateSettingsSuccess.match(action)) {
        draftState.working = false;
        draftState.error = false;
        draftState.message = action.payload.message || null;
        draftState.emailSettings = action.payload.emailSettings || null;
      } else if (EmailActions.updateSettingsFailure.match(action)) {
        draftState.working = false;
        draftState.error = true;
        draftState.message = action.payload.message || null;
        draftState.emailSettings = action.payload.emailSettings || null;
      }
    });
  };
}

const selectEmailSettings: (state) => EmailSettings = (state) => state.EmailSettings;

export { selectEmailSettings, createEmailSettingsReducer };
