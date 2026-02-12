import { Feature } from 'maplibre-gl';
import { ActivitySubtypes, ActivityType } from 'sharedAPI';

interface BaseForm {
  subtype: ActivitySubtypes;
  type: ActivityType;
  short_id?: string;
  form_status?: string;
  created_by?: string;
  linked_activities: { short_id: string; full: string }[];
  geom?: Feature;
  date: Date;
  area_m: number;
  latitude: number;
  longitude: number;
  utm_zone: number;
  utm_easting: number;
  utm_northing: number;
  employer: string;
  funding_agencies: Array<{ invasive_species_agency_code: string }>;
  jurisdictions: { percent_covered: number; jurisdiction: string }[];
  subtype_data: unknown;
  location_description: string;
  access_description: string;
  projects: { description: string }[];
  comment: string;
}

export type { BaseForm };
