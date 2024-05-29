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
    switch (action.type) {
      case EMAIL_TEMPLATES_RETRIEVE_REQUEST:
        return {
          ...state,
          working: true,
          error: false,
          message: null,
          emailTemplates: null
        };
      case EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS:
      case EMAIL_TEMPLATES_UPDATE_SUCCESS:
      case EMAIL_TEMPLATES_SET_ACTIVE:
        return {
          ...state,
          working: false,
          error: false,
          ...action.payload
        };
      case EMAIL_TEMPLATES_UPDATE_FAILURE:
        return {
          ...state,
          working: false,
          error: true,
          ...action.payload
        };
      default:
        return state;
    }
  };
}

const selectEmailTemplates: (state) => EmailTemplates = (state) => state.EmailTemplates;

export { selectEmailTemplates, createEmailTemplatesReducer };
