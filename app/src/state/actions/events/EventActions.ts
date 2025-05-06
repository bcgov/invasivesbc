import { createAction } from '@reduxjs/toolkit';

interface ViewportResizePayload {
  width: number;
  height: number;
}

class EventActions {
  public static readonly PREFIX = 'EventActions';

  /* fired for window.onfocus and window.visibilitychange (with document.hidden == false). for detecting wakeups on mobile. */
  static readonly wakeup = createAction(`${this.PREFIX}/wakeup`);
  static readonly viewportResize = createAction<ViewportResizePayload>(`${this.PREFIX}/viewportResize`);
}

export default EventActions;
