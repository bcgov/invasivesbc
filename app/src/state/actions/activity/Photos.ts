import { createAction } from '@reduxjs/toolkit';
import UploadedPhoto from 'interfaces/UploadedPhoto';
import { ActivityState } from 'state/reducers/activity';

interface DeleteSuccess extends ActivityState {
  media: UploadedPhoto[];
  media_keys: string[];
  media_delete_keys: string[];
}

class Photos {
  private static readonly PREFIX = 'Photos';
  static readonly add = createAction<UploadedPhoto>(`${this.PREFIX}/add`);
  static readonly addSuccess = createAction(`${this.PREFIX}/addSuccess`);
  static readonly addFailure = createAction(`${this.PREFIX}/addFailure`);

  static readonly edit = createAction(`${this.PREFIX}/edit`);
  static readonly editSuccess = createAction<UploadedPhoto[]>(`${this.PREFIX}/editSuccess`);
  static readonly editFailure = createAction(`${this.PREFIX}/editFailure`);

  static readonly delete = createAction<UploadedPhoto>(`${this.PREFIX}/delete`);
  static readonly deleteSuccess = createAction<DeleteSuccess>(`${this.PREFIX}/deleteSuccess`);
  static readonly deleteFailure = createAction(`${this.PREFIX}/deleteFailure`);

  static readonly update = createAction(`${this.PREFIX}/update`);
  static readonly updateSuccess = createAction(`${this.PREFIX}/updateSuccess`);
  static readonly updateFailure = createAction(`${this.PREFIX}/updateFailure`);
}

export default Photos;
