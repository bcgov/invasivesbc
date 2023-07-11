import { Feature } from 'geojson';
import { ActivityType, ActivitySubtype } from 'sharedLibWithAPI/activityCreate';

export interface IActivity {
  _id: string;
  id?: string;
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
