import { createAction } from '@reduxjs/toolkit';

class AppActions {
  private static readonly PREFIX = 'AppActions';

  public static readonly urlChange = createAction<string>(`${this.PREFIX}/urlChange`);
}

export default AppActions;
