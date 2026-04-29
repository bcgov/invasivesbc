import { GeoJSON } from 'geojson';
import { ActivitySubtypes, ActivityType } from 'sharedAPI';

interface IOfflineActivityRow {
  activity_id: string;
  short_id: string;
  geom: GeoJSON;
  type: ActivityType;
  subtype: ActivitySubtypes;
  date: string;
  area_m: string;
  jurisdictions: string;
  invasive_plants: string;
  funding_agencies: string;
  created_by: string;
  status: string;
}

export default IOfflineActivityRow;
