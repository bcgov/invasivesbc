import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import {
  EMAIL_TEMPLATES_RETRIEVE_REQUEST,
  EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS,
  EMAIL_TEMPLATES_SET_ACTIVE,
  EMAIL_TEMPLATES_UPDATE_FAILURE,
  EMAIL_TEMPLATES_UPDATE_SUCCESS
} from 'state/actions';

interface EmailTemplates {
  message: string | null;
  activetemplate: string | null;
  working: boolean;
  error: boolean;
  emailTemplates: {
    id: number;
    fromemail: string;
    emailsubject: string;
    emailbody: string;
    templatename: string;
  }[];
}

function createEmailTemplatesReducer() {
  const initialState: EmailTemplates = {
    working: false,
    error: false,
    message: null,
    activetemplate: null,
    emailTemplates: []
  };

  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<EmailTemplates>) => {
      switch (action.type) {
        case EMAIL_TEMPLATES_RETRIEVE_REQUEST:
          draftState.working = true;
          draftState.error = false;
          draftState.message = null;
          draftState.emailTemplates = [];
          break;
        case EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS:
        case EMAIL_TEMPLATES_UPDATE_SUCCESS:
        case EMAIL_TEMPLATES_SET_ACTIVE:
          draftState.working = false;
          draftState.error = false;
          draftState.message = action.payload.message || null;
          draftState.emailTemplates = action.payload.emailTemplates || [];
          if (Object.hasOwn(action.payload, 'activetemplate')) {
            draftState.activetemplate = action.payload.activetemplate;
          }
          break;
        case EMAIL_TEMPLATES_UPDATE_FAILURE:
          draftState.working = false;
          draftState.error = true;
          draftState.message = action.payload.message || null;
          draftState.emailTemplates = action.payload.emailTemplates || [];
          break;
        default:
          break;
      }
    });
  };
}

const selectEmailTemplates: (state) => EmailTemplates = (state) => state.EmailTemplates;

export { selectEmailTemplates, createEmailTemplatesReducer };
