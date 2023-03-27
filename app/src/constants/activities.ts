
import { Assignment, Build, SvgIconComponent, Visibility } from '@mui/icons-material';
import { ActivityType } from 'sharedLibWithAPI/activityCreate';
// this stuff would make a lot more sense in a database table
export const ActivityTypeIcon: { [key: string]: SvgIconComponent } = {
    [ActivityType.Observation]: Assignment,
    [ActivityType.Treatment]: Build,
    [ActivityType.Monitoring]: Visibility,
    [ActivityType.Collection]: Assignment,
    [ActivityType.FREP]: Visibility
  };
  