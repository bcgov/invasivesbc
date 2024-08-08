import AlertMessage from 'interfaces/AlertMessage';
import { AlertSeverity, AlertSubjects } from './alertEnums';

const mappingAlertMessages: Record<string, AlertMessage> = {
  // Errors
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

  // Success
  trackingStarted: {
    content: 'Start walking to draw a geometry. Click the button again to stop.',
    severity: AlertSeverity.Info,
    subject: AlertSubjects.Map,
    autoClose: 5
  },
  trackingStoppedSuccess: {
    content: 'Tracking Completed Successfully',
    severity: AlertSeverity.Success,
    subject: AlertSubjects.Map,
    autoClose: 3
  }
};

export default mappingAlertMessages;
