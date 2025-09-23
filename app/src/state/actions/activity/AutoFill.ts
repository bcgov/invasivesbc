import { createAction } from '@reduxjs/toolkit';

class AutoFill {
  private static readonly PREFIX = 'AutoFill';
  static readonly update = createAction(`${this.PREFIX}/update`);
  static readonly updateSuccess = createAction(`${this.PREFIX}/updateSuccess`);
  static readonly updateFailure = createAction(`${this.PREFIX}/updateFailure`);
  static readonly copyGeometry = createAction<string>(`${this.PREFIX}/copyGeometry`);
}

export default AutoFill;
