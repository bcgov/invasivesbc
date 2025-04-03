import { createAction } from '@reduxjs/toolkit';

class EventActions {
  public static readonly PREFIX = 'EventActions';

  /* fired for window.onfocus and window.visibilitychange (with document.hidden == false). for detecting wakeups on mobile. */
  static readonly wakeup = createAction(`${this.PREFIX}/wakeup`);
}

export default EventActions;
