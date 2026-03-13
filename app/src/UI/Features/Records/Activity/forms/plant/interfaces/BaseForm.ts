import { Feature } from 'maplibre-gl';
import { ActivitySubtypes, ActivityType } from 'sharedAPI';

interface BaseForm {
  id?: string;
  subtype: ActivitySubtypes;
  type?: ActivityType;
  short_id?: string;
  form_status?: string;
  created_by?: string;
  linked_activities: Array<{
    short_id: string;
    full: string;
  }>;
  geom?: Feature;
  date: string;
  area_m: number;
  latitude: number;
  longitude: number;
  utm_zone: number;
  utm_easting: number;
  utm_northing: number;
  employer: string;
  participants: Array<{
    name: string;
    pac_number?: number;
  }>;
  funding_agencies: Array<{
    invasive_species_agency_code: string;
  }>;
  jurisdictions: Array<{
    percent_covered: number;
    jurisdiction: string;
  }>;
  subtype_data: unknown;
  location_description: string;
  access_description: string;
  projects: Array<{
    description: string;
  }>;
  comment: string;
}

export type { BaseForm };
