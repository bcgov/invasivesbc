import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from '.';

/**
 * Subtype Specific Information for Terrestrial Plant Observations
 */
interface TerrestrialPlantObservationSchema extends BaseForm {
  subtype: ActivitySubtypes.Observation_Plant_Terrestrial;
  subtype_data: {
    entries: Array<{
      density: string;
      distribution: string;
      invasive_plant: string;
      life_stage: string;
      observation_type: string;
      voucher_specimen?: {
        voucher_sample_id: string;
        herbarium: string;
        accession_number: string;
        completed_by_person: string;
        completed_by_org: string;
        utm_zone: number;
        utm_easting: number;
        utm_northing: number;
        date_collected: string;
        date_verified: string;
      };
    }>;
    pretreatment_observation: string;
    context: {
      research_observation: string;
      visible_well_nearby: string;
      aspect: string;
      slope_percent: string;
      soil_texture: string;
      specific_uses: Array<string>;
      suitable_for_biocontrol_agent: string;
    };
  };
}

export type { TerrestrialPlantObservationSchema };
