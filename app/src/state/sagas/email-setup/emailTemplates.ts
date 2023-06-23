import {
  EMAIL_TEMPLATES_RETRIEVE_REQUEST,
  EMAIL_TEMPLATES_RETRIEVE_REQUEST_SUCCESS,
  EMAIL_TEMPLATES_UPDATE,
  EMAIL_TEMPLATES_UPDATE_SUCCESS,
  EMAIL_TEMPLATES_UPDATE_FAILURE,
} from "state/actions";
import { all, takeEvery, select, put } from "redux-saga/effects";
import { selectConfiguration } from "state/reducers/configuration";
import { selectAuth } from "state/reducers/auth";
import { Http } from "@capacitor-community/http";

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
      emailTemplates: {
        fromEmail: data.result[0].fromemail,
        emailSubject: data.result[0].emailsubject,
        emailBody: data.result[0].emailbody,
        id: data.result[0].id,
      }
    }
  });
};

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
  if (data.code >= 200 && data.code <= 300)
    yield put({
      type: EMAIL_TEMPLATES_UPDATE_SUCCESS, payload: {
        'message': 'Email template updated successfully',
        'emailTemplates': data.request,
      }
    });
  else
    yield put({
      type: EMAIL_TEMPLATES_UPDATE_FAILURE, payload: {
        'message': data.message,
        'emailTemplates': data.request,
      }
    });
};

function* emailTemplatesSaga() {
  yield all([
    takeEvery(EMAIL_TEMPLATES_UPDATE, updateEmailTemplates),
    takeEvery(EMAIL_TEMPLATES_RETRIEVE_REQUEST, fetchEmailTemplates),
  ]);
}

export default emailTemplatesSaga;
