import { createAction } from '@reduxjs/toolkit';
import { IEmailUpdateTemplate } from 'state/reducers/emailTemplates';

interface IUpdateEmailSettings {
  enabled: boolean;
  authenticationURL: string;
  emailServiceURL: string;
  clientId: string;
  clientSecret: string;
}
interface IRetrieveEmailSettings {
  emailSettings: { id: number } & IUpdateEmailSettings;
  message?: string;
}

interface IEmailUpdateTemplateSuccess {
  message?: string;
  emailTemplates: Array<IEmailUpdateTemplate>;
}
class EmailActions {
  private static readonly PREFIX = 'EmailActions';
  public static readonly updateSettingsReq = createAction<IUpdateEmailSettings>(`${this.PREFIX}/updateSettingsReq`);
  public static readonly updateSettingsSuccess = createAction<IRetrieveEmailSettings>(
    `${this.PREFIX}/updateSettingsSuccess`
  );
  public static readonly updateSettingsFailure = createAction<IRetrieveEmailSettings>(
    `${this.PREFIX}/updateSettingsFailure`
  );
  public static readonly retrieveReq = createAction(`${this.PREFIX}/retrieveReq`);
  public static readonly retrieveReqSuccess = createAction<IRetrieveEmailSettings>(`${this.PREFIX}/retrieveReqSuccess`);
  public static readonly updateTemplate = createAction<IEmailUpdateTemplate>(`${this.PREFIX}/updateTemplate`);
  public static readonly updateTemplateSuccess = createAction<IEmailUpdateTemplateSuccess>(
    `${this.PREFIX}/updateTemplateSuccess`
  );
  public static readonly updateTemplateFailure = createAction<IEmailUpdateTemplateSuccess>(
    `${this.PREFIX}/updateTemplateFailure`
  );
  public static readonly setTemplate = createAction<string>(`${this.PREFIX}/setTemplate`);
  public static readonly retrieveTemplate = createAction(`${this.PREFIX}/retrieveTemplate`);
  public static readonly retrieveTemplateSuccess = createAction<IEmailUpdateTemplateSuccess>(
    `${this.PREFIX}/retrieveTemplateSuccess`
  );
}

export { EmailActions };
export type { IRetrieveEmailSettings, IUpdateEmailSettings };
