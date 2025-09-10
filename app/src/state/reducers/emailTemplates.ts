import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { EmailActions } from 'state/actions/email/emailActions';

interface IEmailTemplate {
  id?: number;
  fromemail: string;
  emailsubject: string;
  emailbody: string;
  templatename: string;
}

interface EmailTemplates {
  message: string | null;
  activetemplate: string | null;
  working: boolean;
  error: boolean;
  emailTemplates: Array<IEmailTemplate>;
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
      draftState.error = false;
      draftState.working = false;
      draftState.message = null;
      if (EmailActions.retrieveReq.match(action)) {
        draftState.working = true;
        draftState.emailTemplates = [];
      } else if (EmailActions.setTemplate.match(action)) {
        draftState.activetemplate = action.payload;
      } else if (EmailActions.retrieveTemplateSuccess.match(action)) {
        draftState.emailTemplates = action.payload.emailTemplates;
      } else if (EmailActions.updateTemplateSuccess.match(action)) {
        draftState.message = action.payload?.message ?? null;
        draftState.emailTemplates = action.payload.emailTemplates || [];
      } else if (EmailActions.updateTemplateFailure.match(action)) {
        draftState.error = true;
        draftState.message = action.payload?.message ?? null;
        draftState.emailTemplates = action.payload.emailTemplates || [];
      }
    });
  };
}

const selectEmailTemplates: (state) => EmailTemplates = (state) => state.EmailTemplates;

export { selectEmailTemplates, createEmailTemplatesReducer };
export type { IEmailTemplate as IEmailUpdateTemplate };
