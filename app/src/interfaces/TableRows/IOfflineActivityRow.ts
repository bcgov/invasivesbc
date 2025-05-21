import { Polygon } from 'geojson';
import { Point } from 'maplibre-gl';
import { ActivitySubtype, ActivityType } from 'sharedAPI';

interface IOfflineActivityRow {
  activity_id: string;
  short_id: string;
  geometry: Array<Polygon | Point>;
  activity_type: ActivityType;
  activity_subtype: ActivitySubtype;
  activity_date: Date;
  reported_area: number;
  jurisdiction_display: string;
  invasive_plant_management_area: string;
  created_by: string;
  agency: string;
}

export default IOfflineActivityRow;
