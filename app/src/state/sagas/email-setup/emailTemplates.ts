import { PayloadAction } from '@reduxjs/toolkit';
import { all, put, select, takeEvery } from 'redux-saga/effects';
import { EmailActions } from 'state/actions/email/emailActions';
import { selectConfiguration } from 'state/reducers/configuration';
import { IEmailUpdateTemplate, selectEmailTemplates } from 'state/reducers/emailTemplates';
import { getCurrentJWT } from 'state/sagas/auth/auth';

function* fetchEmailTemplates() {
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/email-templates`, {
    headers: {
      Authorization: yield getCurrentJWT()
    }
  });
  yield put(EmailActions.retrieveTemplateSuccess({ emailTemplates: (yield res.json())?.result }));
}

function* updateEmailTemplates(action: PayloadAction<IEmailUpdateTemplate>) {
  const configuration = yield select(selectConfiguration);
  const res = yield fetch(configuration.API_BASE + `/api/email-templates`, {
    method: 'PUT',
    headers: {
      Authorization: yield getCurrentJWT(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(action.payload)
  });

  const data = yield res.json();

  const emailTemplatesState = yield select(selectEmailTemplates);
  const updateTemplates = [...emailTemplatesState.emailTemplates];

  updateTemplates[updateTemplates.findIndex((template) => template.templatename === data.request.templatename)] =
    data.request;

  if (data.code >= 200 && data.code <= 300) {
    yield put(
      EmailActions.updateTemplateSuccess({
        message: 'Email template updated successfully',
        emailTemplates: updateTemplates
      })
    );
  } else
    yield put(
      EmailActions.updateTemplateFailure({
        message: data.message,
        emailTemplates: emailTemplatesState.emailTemplates
      })
    );
}

function* emailTemplatesSaga() {
  yield all([
    takeEvery(EmailActions.updateTemplate, updateEmailTemplates),
    takeEvery(EmailActions.retrieveTemplate, fetchEmailTemplates)
  ]);
}

export default emailTemplatesSaga;
