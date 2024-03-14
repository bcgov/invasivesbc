import { Http } from "@capacitor-community/http";
import { all, put, select, takeEvery } from "redux-saga/effects";
import { EMAIL_TEMPLATES_RETRIEVE_REQUEST, EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS, EMAIL_TEMPLATES_UPDATE, EMAIL_TEMPLATES_UPDATE_FAILURE, EMAIL_TEMPLATES_UPDATE_SUCCESS } from "state/actions";
import { selectAuth } from "state/reducers/auth";
import { selectConfiguration } from "state/reducers/configuration";
import { selectEmailTemplates } from "state/reducers/emailTemplates";

function* fetchEmailTemplates() {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);

  const { data } = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/email-templates`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    }
  });
  yield put({
    type: EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS, payload: {
      'emailTemplates': data.result
    }
  });
}

function* updateEmailTemplates(action) {
  const configuration = yield select(selectConfiguration);
  const { requestHeaders } = yield select(selectAuth);
  const { data } = yield Http.request({
    method: 'PUT',
    url: configuration.API_BASE + `/api/email-templates`,
    headers: {
      Authorization: requestHeaders.authorization,
      'Content-Type': 'application/json'
    },
    data: action.payload
  });
  const emailTemplatesState = yield select(selectEmailTemplates);
  emailTemplatesState.emailTemplates[emailTemplatesState.emailTemplates.findIndex(template => template.templatename === data.request.templatename)] = data.request
  if (data.code >= 200 && data.code <= 300) {
    yield put({
      type: EMAIL_TEMPLATES_UPDATE_SUCCESS, payload: {
        'message': 'Email template updated successfully',
        emailTemplates: emailTemplatesState.emailTemplates
      }
    });
  }
  else
    yield put({
      type: EMAIL_TEMPLATES_UPDATE_FAILURE, payload: {
        'message': data.message,
        emailTemplates: emailTemplatesState.emailTemplates
      }
    });
}

function* emailTemplatesSaga() {
  yield all([
    takeEvery(EMAIL_TEMPLATES_UPDATE, updateEmailTemplates),
    takeEvery(EMAIL_TEMPLATES_RETRIEVE_REQUEST, fetchEmailTemplates),
  ]);
}

export default emailTemplatesSaga;
