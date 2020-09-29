import { SvgIconComponent, Assignment, Build, Visibility } from '@material-ui/icons';

export enum ActivityType {
  OBSERVATION = 'observation',
  TREATMENT = 'treatment',
  MONITORING = 'monitoring'
}

export const ActivityTypeIcon: { [key: string]: SvgIconComponent } = {
  [ActivityType.OBSERVATION]: Assignment,
  [ActivityType.TREATMENT]: Build,
  [ActivityType.MONITORING]: Visibility
};

export enum ActivityStatus {
  NEW = 'New',
  EDITED = 'Edited'
}

export enum ActivitySyncStatus {
  NOT_SYNCED = 'Not Synced',
  SYNC_SUCCESSFUL = 'Sync Successful',
  SYNC_FAILED = 'Sync Failed'
}
