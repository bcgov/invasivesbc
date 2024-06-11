import {
  EMAIL_TEMPLATES_RETRIEVE_REQUEST,
  EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS,
  EMAIL_TEMPLATES_SET_ACTIVE,
  EMAIL_TEMPLATES_UPDATE_FAILURE,
  EMAIL_TEMPLATES_UPDATE_SUCCESS
} from 'state/actions';

interface EmailTemplates {
  message: string;
  activetemplate: string;
  emailTemplates: [
    {
      id: number;
      fromemail: string;
      emailsubject: string;
      emailbody: string;
      templatename: string;
    }
  ];
}

function createEmailTemplatesReducer() {
  const initialState: EmailTemplates = {
    message: null,
    activetemplate: null,
    emailTemplates: null
  };

  return (state = initialState, action) => {
    if (EMAIL_TEMPLATES_RETRIEVE_REQUEST.match(action)) {
      return {
        ...state,
        working: true,
        error: false,
        message: null,
        emailTemplates: null
      };
    }
    if (EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        ...action.payload
      };
    }
    if (EMAIL_TEMPLATES_UPDATE_SUCCESS.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        ...action.payload
      };
    }
    if (EMAIL_TEMPLATES_SET_ACTIVE.match(action)) {
      return {
        ...state,
        working: false,
        error: false,
        ...action.payload
      };
    }

    if (EMAIL_TEMPLATES_UPDATE_FAILURE.match(action))
      return {
        ...state,
        working: false,
        error: true,
        ...action.payload
      };
    return state;
  };
}

const selectEmailTemplates: (state) => EmailTemplates = (state) => state.EmailTemplates;

export { selectEmailTemplates, createEmailTemplatesReducer };
