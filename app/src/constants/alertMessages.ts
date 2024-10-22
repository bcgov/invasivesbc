import AlertMessage from 'interfaces/AlertMessage';
import { AlertSeverity, AlertSubjects } from './alertEnums';

const mappingAlertMessages: Record<string, AlertMessage> = {
  // Errors
  cannotGetUsersCoordinates: {
    content: "We couldn't access your location. Please check your location settings and try again!",
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Map,
    autoClose: 15
  },
  notWithinBC: {
    content: 'Activity is not within BC',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Map
  },
  noAreaCalculated: {
    content: 'The calculated area of your shape is 0, please add more points',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Map
  },
  willContainIntersections: {
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Map,
    content: 'Closing this geometry will result in a shape intersection being formed. Please adjust appropriately.'
  },
  containsIntersections: {
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Map,
    content: 'Activity geometry intersects itself'
  },
  cannotValidateRegion: {
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Map,
    content: 'An error occured while validating the GeoTracking shape, please try again.',
    autoClose: 10
  },
  trackMyPathStoppedEarly: {
    content: '"Track my path" stopped.',
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Map,
    autoClose: 5
  },
  doesNotEvaluateAsPolygon: {
    content: 'Given Coordinates could not be evaluated as a Polygon. you may need to update or add new points',
    severity: AlertSeverity.Error,
    subject: AlertSubjects.Map
  },

  // Info
  canEditInfo: {
    content: 'You can adjust or add to your geometry manually by selecting the blue line, and moving points as needed',
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Map,
    autoClose: 5
  },

  // Warnings
  wellsInsideTreatmentArea: {
    content: 'Warning! Wells inside treatment area',
    severity: AlertSeverity.Warning,
    subject: AlertSubjects.Map
  },
  trackingPaused: {
    content: 'GeoTracking paused',
    severity: AlertSeverity.Warning,
    subject: AlertSubjects.Map,
    autoClose: 3
  },
  trackingResumed: {
    content: 'GeoTracking resumed',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Map,
    autoClose: 3
  },
  // Success
  trackingStarted: {
    content: 'Start walking to draw a geometry. Click the button again to stop.',
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Map,
    autoClose: 5
  },
  trackingStartedPolygon: {
    content:
      'Start walking to create a shape. Click the button again to stop. When tracking ends, your shape will be closed, forming a polygon.',
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Map,
    autoClose: 8
  },
  trackingStartedLineString: {
    content:
      "Begin drawing a shape by walking. Click the button again to stop. Once your shape is complete, you'll be asked to specify a buffer zone.",
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Map,
    autoClose: 8
  },
  trackingStoppedSuccess: {
    content: 'Tracking Completed Successfully',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Map,
    autoClose: 3
  }
};

export default mappingAlertMessages;
