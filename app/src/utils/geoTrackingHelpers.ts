import { GeoTrackingStatus } from 'constants/geoTrackingStatus';

export const isTracking = (status: GeoTrackingStatus) =>
  status === GeoTrackingStatus.TRACKING_AND_DRAWING || status === GeoTrackingStatus.ONLY_TRACKING;

export const isDrawing = (status: GeoTrackingStatus) => status === GeoTrackingStatus.TRACKING_AND_DRAWING;

export const isPaused = (status: GeoTrackingStatus) => status === GeoTrackingStatus.ONLY_TRACKING;
