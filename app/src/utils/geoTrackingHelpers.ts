import { GeoTrackingStatus } from 'constants/geoTrackingStatus';

export const isTracking = (status: GeoTrackingStatus) =>
  status === GeoTrackingStatus.TRACKING_AND_DRAWING || status === GeoTrackingStatus.ONLY_TRACKING;

export const isDrawing = (status: GeoTrackingStatus) => status === GeoTrackingStatus.TRACKING_AND_DRAWING;

export const isPaused = (status: GeoTrackingStatus) => status === GeoTrackingStatus.ONLY_TRACKING;

export const isEditing = (status: GeoTrackingStatus, isEditActive: boolean) => isPaused(status) && isEditActive;

export const hasCompleted = (status: GeoTrackingStatus) => status === GeoTrackingStatus.COMPLETED;

export const hasExited = (status: GeoTrackingStatus) => status === GeoTrackingStatus.EXITED;

export const hasEnded = (status: GeoTrackingStatus) =>
  status === GeoTrackingStatus.COMPLETED || status === GeoTrackingStatus.EXITED;
