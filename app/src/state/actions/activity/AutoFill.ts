import { createAction } from '@reduxjs/toolkit';
import {
  ACTIVITY_UPDATE_AUTOFILL_REQUEST,
  ACTIVITY_UPDATE_AUTOFILL_SUCCESS,
  ACTIVITY_UPDATE_AUTOFILL_FAILURE
} from '../../actions';

class AutoFill {
  static readonly ACTIVITY_UPDATE_AUTOFILL_REQUEST = createAction(ACTIVITY_UPDATE_AUTOFILL_REQUEST);
  static readonly ACTIVITY_UPDATE_AUTOFILL_SUCCESS = createAction(ACTIVITY_UPDATE_AUTOFILL_SUCCESS);
  static readonly ACTIVITY_UPDATE_AUTOFILL_FAILURE = createAction(ACTIVITY_UPDATE_AUTOFILL_FAILURE);
}

export default AutoFill;
