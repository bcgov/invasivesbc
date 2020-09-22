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
