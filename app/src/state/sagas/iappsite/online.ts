import { InvasivesAPI_Call } from "hooks/useInvasivesApi";
import { call, put } from "redux-saga/effects";
import { IAPP_GET_MEDIA_FAILURE, IAPP_GET_MEDIA_SUCCESS, IAPP_GET_SUCCESS } from "state/actions";
import { Http } from '@capacitor-community/http';
import { encode, decode } from 'js-base64';

export function* handle_IAPP_GET_NETWORK_REQUEST(action) {
  const networkReturn = yield InvasivesAPI_Call('GET', `/api/points-of-interest/`, { iappSiteID: action.payload.iappID, isIAPP: true, site_id_only: false });
  const data = networkReturn?.data?.result?.rows[0];

  yield put({ type: IAPP_GET_SUCCESS, payload: { iapp: data } });
}

export function* handle_IAPP_GET_MEDIA_ONLINE(action) {
  try {
    // would be getting from s3 bucket
    const { data, status, url } = yield Http.request({
      method: 'GET',
      headers: {'Content-Type': 'image/jpeg' },
      url: 'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    });
    console.log("%c data: ", "color: yellow", data);

    // yield call(Https.get('https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'));
    //grab s3
    const tempBlob = {
      file_name: action.payload.media_key,
      encoded_file: 'data:image/jpeg;base64, ' + encode(data),
      description: 'untitled'
    };

    yield put({
      type: IAPP_GET_MEDIA_SUCCESS,
      payload: {
        media: tempBlob
      }
    })
  } catch(e) {
    console.error(e);
    yield put({type: IAPP_GET_MEDIA_FAILURE});
  }
}