export enum GeoTrackingStatus {
  IDLE = 'Idle', // Not tracking or drawing
  TRACKING_AND_DRAWING = 'Tracking', // GPS on, drawing on
  ONLY_TRACKING = 'Paused', // GPS on, drawing off
  COMPLETED = 'Completed', // Drawing finished
  EXITED = 'Exited' // User exited early
}
