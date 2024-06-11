import {
  EMAIL_SETTINGS_RETRIEVE_REQUEST,
  EMAIL_SETTINGS_RETRIEVE_REQUEST_SUCCESS,
  EMAIL_SETTINGS_UPDATE_FAILURE,
  EMAIL_SETTINGS_UPDATE_SUCCESS
} from 'state/actions';

interface EmailSettings {
  message: string;
  emailSettings: {
    enabled: boolean;
    id: number;
    authenticationURL: string;
    emailServiceURL: string;
    clientId: string;
    clientSecret: string;
  };
}

function createEmailSettingsReducer() {
  const initialState: EmailSettings = {
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

const selectEmailSettings: (state) => EmailSettings = (state) => state.EmailSettings;

export { selectEmailSettings, createEmailSettingsReducer };
