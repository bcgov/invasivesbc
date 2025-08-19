import { createAction } from '@reduxjs/toolkit';
import { IUserExtendedInfo } from 'state/reducers/auth';

class AppActions {
  private static readonly PREFIX = 'AppActions';

  public static readonly urlChange = createAction<string>(`${this.PREFIX}/urlChange`);
}

export default AppActions;
