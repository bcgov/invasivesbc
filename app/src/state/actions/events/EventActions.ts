import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import DeviceInformation from 'utils/memory-report/memoryReport';
import { Platform, buildTimeConfig } from 'state/configuration/build-time-config';

interface ViewportResizePayload {
  width: number;
  height: number;
}

class EventActions {
  public static readonly PREFIX = 'EventActions';

  /* fired for window.onfocus and window.visibilitychange (with document.hidden == false). for detecting wakeups on mobile. */
  static readonly wakeup = createAction(`${this.PREFIX}/wakeup`);
  static readonly viewportResize = createAction<ViewportResizePayload>(`${this.PREFIX}/viewportResize`);
  static readonly deviceMemoryReport = createAsyncThunk(`${this.PREFIX}/deviceMemoryReport`, async () => {
    if (buildTimeConfig.PLATFORM !== Platform.ANDROID) {
      throw new Error('This action is only meaningful on Android');
    }
    return await DeviceInformation.deviceCharacteristics({});
  });
}

export default EventActions;
