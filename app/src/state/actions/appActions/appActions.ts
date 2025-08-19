import { createAction } from '@reduxjs/toolkit';

interface IGlobalError {
  detail: {
    error: Error;
    errorInfo: { sagaStack: string };
  };
}
class AppActions {
  private static readonly PREFIX = 'AppActions';

  public static readonly urlChange = createAction<string>(`${this.PREFIX}/urlChange`);
  public static readonly crashHandleGlobalError = createAction<IGlobalError>(`${this.PREFIX}/crashHandleGlobalError`);
  public static readonly toggleCustomLayersModal = createAction(`${this.PREFIX}/toggleCustomLayersModal`);
}

export default AppActions;
