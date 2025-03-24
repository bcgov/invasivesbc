import { createAction } from '@reduxjs/toolkit';

class AuthActions {
  private static readonly PREFIX = 'Auth';

  static readonly requestComplete = createAction<{ idToken: string }>(`${this.PREFIX}/requestComplete`);
  static readonly requestError = createAction(`${this.PREFIX}/requestError`);
  static readonly initializeRequest = createAction(`${this.PREFIX}/initializeRequest`);
  static readonly initializeComplete = createAction<{
    authenticated?: boolean;
    idToken: string | undefined;
  }>(`${this.PREFIX}/initializeComplete`);

  static Keycloak = class {
    static readonly reinit = createAction(`${AuthActions.PREFIX}/reinit`);
  };

  static Native = class {};

  static readonly tokenValidationRequest = createAction(`${this.PREFIX}/tokenValidationRequest`);

  static readonly signinRequest = createAction(`${this.PREFIX}/signinRequest`);
  static readonly signoutRequest = createAction(`${this.PREFIX}/signoutRequest`);
  static readonly signoutComplete = createAction(`${this.PREFIX}/signoutComplete`);
  static readonly updateTokenState = createAction<{ idToken: string }>(`${this.PREFIX}/updateTokenState`);
  static readonly disrupted = createAction(`${this.PREFIX}/disrupted`);
  static readonly recovered = createAction(`${this.PREFIX}/recovered`);
  static readonly clearRoles = createAction(`${this.PREFIX}/clearRoles`);
  static readonly refreshRolesRequest = createAction(`${this.PREFIX}/refreshRolesRequest`);
  static readonly refreshRolesError = createAction(`${this.PREFIX}/refreshRolesError`);
  static readonly refreshRolesComplete = createAction<{
    all_roles: { role_id: number; role_name: string }[];
    roles: { role_id: number; role_name: string }[];
    extendedInfo: {
      user_id: number | null;
      account_status: number | null;
      activation_status: number | null;
      work_phone_number: string | null;
      funding_agencies: any[];
      employer: string | null;
      pac_number: string | null;
      pac_service_number_1: string | null;
      pac_service_number_2: string | null;
    };
    v2BetaAccess: boolean;
  }>(`${this.PREFIX}/refreshRolesComplete`);
  static readonly saveCurrentToOffline = createAction(`${this.PREFIX}/saveCurrentToOffline`);
  static readonly makeOfflineUserCurrent = createAction<{
    displayName: string;
  }>(`${this.PREFIX}/makeOfflineUserCurrent`);
  static readonly forgetOfflineUser = createAction<{ displayName: string }>(`${this.PREFIX}/forgetOfflineUser`);
  static readonly openOfflineUserSelectionDialog = createAction<boolean>(
    `${this.PREFIX}/openOfflineUserSelectionDialog`
  );
}

export { AuthActions };
