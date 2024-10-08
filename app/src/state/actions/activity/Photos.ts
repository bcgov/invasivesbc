import { createAction } from '@reduxjs/toolkit';
import UploadedPhoto from 'interfaces/UploadedPhoto';
import {
  ACTIVITY_ADD_PHOTO_REQUEST,
  ACTIVITY_ADD_PHOTO_SUCCESS,
  ACTIVITY_ADD_PHOTO_FAILURE,
  ACTIVITY_EDIT_PHOTO_REQUEST,
  ACTIVITY_EDIT_PHOTO_SUCCESS,
  ACTIVITY_EDIT_PHOTO_FAILURE,
  ACTIVITY_DELETE_PHOTO_REQUEST,
  ACTIVITY_DELETE_PHOTO_FAILURE,
  ACTIVITY_DELETE_PHOTO_SUCCESS,
  ACTIVITY_UPDATE_PHOTO_REQUEST,
  ACTIVITY_UPDATE_PHOTO_SUCCESS,
  ACTIVITY_UPDATE_PHOTO_FAILURE
} from '../../actions';
import { ActivityState } from 'state/reducers/activity';

interface DeleteSuccess extends ActivityState {
  media: UploadedPhoto[];
  media_keys: string[];
  media_delete_keys: string[];
}

class Photos {
  static readonly add = createAction<UploadedPhoto>(ACTIVITY_ADD_PHOTO_REQUEST);
  static readonly addSuccess = createAction(ACTIVITY_ADD_PHOTO_SUCCESS);
  static readonly addFailure = createAction(ACTIVITY_ADD_PHOTO_FAILURE);

  static readonly edit = createAction(ACTIVITY_EDIT_PHOTO_REQUEST);
  static readonly editSuccess = createAction<UploadedPhoto[]>(ACTIVITY_EDIT_PHOTO_SUCCESS);
  static readonly editFailure = createAction(ACTIVITY_EDIT_PHOTO_FAILURE);

  static readonly delete = createAction<UploadedPhoto>(ACTIVITY_DELETE_PHOTO_REQUEST);
  static readonly deleteSuccess = createAction<DeleteSuccess>(ACTIVITY_DELETE_PHOTO_SUCCESS);
  static readonly deleteFailure = createAction(ACTIVITY_DELETE_PHOTO_FAILURE);

  static readonly update = createAction(ACTIVITY_UPDATE_PHOTO_REQUEST);
  static readonly updateSuccess = createAction(ACTIVITY_UPDATE_PHOTO_SUCCESS);
  static readonly updateFailure = createAction(ACTIVITY_UPDATE_PHOTO_FAILURE);
}

export default Photos;
