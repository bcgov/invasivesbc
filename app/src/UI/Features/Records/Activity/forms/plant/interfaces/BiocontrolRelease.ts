import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from '.';

interface BiocontrolReleaseSchema extends BaseForm {
  subtype: ActivitySubtypes.Biocontrol_Release;
  subtype_data: {
    entries: Array<{
      agent_source: string;
      biocontrol_agent: string;
      collection_date: Date;
      linear_segment: string;
      invasive_plant: string;
      mortality: number;
      plant_collected_from: string;
      plant_collected_from_manual: string;
      estimated_biological_agents: Array<{
        quantity: number;
        stage: string;
      }>;
      actual_biological_agents: Array<{
        quantity: number;
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
        height_cm: number;
      }>;
    };
    // Microsites
    mesoslope_position: string;
    site_surface_shape: string;
    // Weather
    comments: string;
    cloud_cover: string;
    precipitation: string;
    temperature: number;
    wind_direction: string;
    wind_speed_kmh: number;
  };
}

export type { BiocontrolReleaseSchema };
