import {
  EMAIL_SETTINGS_RETRIEVE_REQUEST,
  EMAIL_SETTINGS_RETRIEVE_REQUEST_SUCCESS,
  EMAIL_SETTINGS_UPDATE_FAILURE,
  EMAIL_SETTINGS_UPDATE_SUCCESS
} from 'state/actions';

export interface EmailSettingsType {
  enabled: boolean;
  id: number | null;
  authenticationURL: string | null;
  emailServiceURL: string | null;
  clientId: string | null;
  clientSecret: string | null;
}

interface EmailSettingsState {
  message: string | null;
  emailSettings: EmailSettingsType | null;
  working: boolean;
  error: boolean;
}

function createEmailSettingsReducer() {
  const initialState: EmailSettingsState = {
    working: false,
    error: false,
    message: null,
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
    if (EMAIL_SETTINGS_RETRIEVE_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        error: false,
        message: null,
        emailSettings: null
      };
    }
    if (EMAIL_SETTINGS_RETRIEVE_REQUEST_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        ...action.payload
      };
    }
    if (EMAIL_SETTINGS_UPDATE_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        ...action.payload
      };
    }
    if (EMAIL_SETTINGS_UPDATE_FAILURE.match(action)) {
      return {
        ...state,
        working: false,
        error: true,
        ...action.payload
      };
    }
    return state;
  };
}

const selectEmailSettings: (state) => EmailSettingsState = (state) => state.EmailSettings;

export { selectEmailSettings, createEmailSettingsReducer };
