import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from '.';

interface BiocontrolCollectionSchema extends BaseForm {
  subtype: ActivitySubtypes.Biocontrol_Collection;
  subtype_data: {
    entries: Array<{
      invasive_plant: string;
      biological_agent: string;
      historical_iapp_site?: number;
      collection_type: string;
      plant_count_collection?: number;
      time_collection_duration_minutes?: number;
      collection_method: string;
      number_of_sweeps?: number;
      start_time_collecting: string;
      end_time_collecting: string;
      comment: string;
      actual_biological_agents: Array<{
        quantity?: number;
        stage: string;
      }>;
      estimated_biological_agents: Array<{
        quantity?: number;
        stage: string;
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
      target_plant_heights: Array<{
        height_cm?: number;
      }>;
    };
    // Microsite Condition
    microsite_conditions: {
      mesoslope_position: string;
      site_surface_shape: string;
    };
    // Weather
    weather_conditions: {
      comments: string;
      cloud_cover: string;
      precipitation: string;
      temperature?: number;
      wind_direction: string;
      wind_speed_kmh?: number;
    };
  };
}

export type { BiocontrolCollectionSchema };
