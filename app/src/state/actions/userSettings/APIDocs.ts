import { createAction } from '@reduxjs/toolkit';

class APIDocs {
  private static readonly PREFIX = `UserSettings/APIDocs`;

  static readonly getRequest = createAction(`${this.PREFIX}/getRequest`);

  /* used for offline persistence. works in conjunction with, and using the same identifier as, the auth reducer */
  static readonly load = createAction<{ displayName: string }>(`${this.PREFIX}/load`);
  static readonly save = createAction<{ displayName: string }>(`${this.PREFIX}/save`);
  static readonly forgetSaved = createAction<{ displayName: string }>(`${this.PREFIX}/forgetSaved`);

  static readonly set = createAction<{
    apiDocsWithViewOptions: object;
    apiDocsWithSelectOptions: object;
  }>(`${this.PREFIX}/getSuccess`);
}

export { APIDocs };
