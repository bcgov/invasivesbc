import { createAction } from '@reduxjs/toolkit';
import {
  ACTIVITY_UPDATE_AUTOFILL_REQUEST,
  ACTIVITY_UPDATE_AUTOFILL_SUCCESS,
  ACTIVITY_UPDATE_AUTOFILL_FAILURE
} from '../../actions';

class AutoFill {
  static readonly update = createAction(ACTIVITY_UPDATE_AUTOFILL_REQUEST);
  static readonly updateSuccess = createAction(ACTIVITY_UPDATE_AUTOFILL_SUCCESS);
  static readonly updateFailure = createAction(ACTIVITY_UPDATE_AUTOFILL_FAILURE);
}

export default AutoFill;
