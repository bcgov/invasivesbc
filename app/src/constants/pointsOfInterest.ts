import { Description, SvgIconComponent } from '@mui/icons-material';

export enum PointOfInterestType {
  IAPP_Site = 'Point Of Interest'
}

export enum PointOfInterestSubtype {
  PointOfInterest_IAPP_Site = 'PointOfInterest_IAPP_SITE'
}

export const PointOfInterestTypeIcon: { [key: string]: SvgIconComponent } = {
  [PointOfInterestType.IAPP_Site]: Description
};

export enum PointOfInterestStatus {
  NEW = 'New',
  EDITED = 'Edited'
}

export enum PointOfInterestSyncStatus {
  NOT_SAVED = 'Not Saved',
  SAVE_SUCCESSFUL = 'Save Successful',
  SAVE_FAILED = 'Saving Failed'
}
