import { all, put, select, takeEvery } from 'redux-saga/effects';
import {
  EMAIL_TEMPLATES_RETRIEVE_REQUEST,
  EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS,
  EMAIL_TEMPLATES_UPDATE,
  EMAIL_TEMPLATES_UPDATE_FAILURE,
  EMAIL_TEMPLATES_UPDATE_SUCCESS
} from 'state/actions';
import { selectConfiguration } from 'state/reducers/configuration';
import { selectEmailTemplates } from 'state/reducers/emailTemplates';
import { getCurrentJWT } from 'state/sagas/auth/auth';

function* fetchEmailTemplates() {
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/email-templates`, {
    headers: {
      Authorization: yield getCurrentJWT()
    }
  });
  yield put({
    type: EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS,
    payload: {
      emailTemplates: (yield res.json())?.result
    }
  });
}

function* updateEmailTemplates(action) {
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
    yield put({
      type: EMAIL_TEMPLATES_UPDATE_SUCCESS,
      payload: {
        message: 'Email template updated successfully',
        emailTemplates: updateTemplates
      }
    });
  } else
    yield put({
      type: EMAIL_TEMPLATES_UPDATE_FAILURE,
      payload: {
        message: data.message,
        emailTemplates: emailTemplatesState.emailTemplates
      }
    });
}

function* emailTemplatesSaga() {
  yield all([
    takeEvery(EMAIL_TEMPLATES_UPDATE, updateEmailTemplates),
    takeEvery(EMAIL_TEMPLATES_RETRIEVE_REQUEST, fetchEmailTemplates)
  ]);
}

export default emailTemplatesSaga;
