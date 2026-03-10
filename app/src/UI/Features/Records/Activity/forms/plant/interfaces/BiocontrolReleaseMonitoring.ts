import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from './BaseForm';

interface BiocontrolReleaseMonitoringSchema extends BaseForm {
  subtype: ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial;
  subtype_data: {
    entries: Array<{
      biocontrol_agent: string;
      biocontrol_present: boolean;
      invasive_plant: string;
      monitoring_type: string;
      plant_count?: number;
      monitoring_method: string;
      count_duration_minutes?: number;
      location_agent_found: Array<string>;
      number_of_sweeps?: number;
      sign_of_biocontrol_presence: Array<string>;
      start_time?: string;
      stop_time?: string;
      suitable_for_collection: string;
      actual_biological_agents: Array<{
        quantity: number;
        stage: string;
        plant_position: string;
        agent_location: string;
      }>;
      estimated_biological_agents: Array<{
        quantity: number;
        stage: string;
        plant_position: string;
        agent_location: string;
      }>;
    }>;
    target_plant_phenology?: {
      winter_dormant: number;
      seedlings: number;
      rosettes: number;
      bolts: number;
      flowering: number;
      seeds_forming: number;
      senescent: number;
      target_plant_heights: Array<{ height_cm: number }>;
    };
    // Microsite
    mesoslope_position: string;
    site_surface_shape: string;
    // Spread
    agent_density?: number;
    plant_attack?: number;
    max_spread_distance_m?: number;
    max_spread_aspect_deg?: number;
    // Weather
    comments: string;
    cloud_cover: string;
    precipitation: string;
    temperature: number;
    wind_direction: string;
    wind_speed_kmh: number;
  };
}

export type { BiocontrolReleaseMonitoringSchema };
