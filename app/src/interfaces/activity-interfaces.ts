import { Feature } from 'geojson';
import { ActivitySubtype, ActivityType } from 'sharedAPI';

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
    error: string | null;
  };
  dateCreated: Date;
  dateUpdated: Date | null;
  formData: unknown;
  formStatus: string;
  geometry: Feature[];
}
