import { ActivitySubtype, ActivityType } from 'constants/activities';
import { Feature } from 'geojson';

export interface IActivity {
  _id: string;
  shortId: string;
  activityId: string;
  docType: string;
  activityType: ActivityType;
  activitySubtype: ActivitySubtype;
  status: string;
  sync: {
    ready: boolean;
    status: string;
    error: string;
  };
  dateCreated: Date;
  dateUpdated: Date;
  formData: any;
  formStatus: string;
  geometry: Feature[];
}
