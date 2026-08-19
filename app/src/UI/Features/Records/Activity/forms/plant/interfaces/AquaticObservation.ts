import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from '.';

/**
 * Subtype Specific Information for Aquatic Plant Observations
 */
interface AquaticPlantObservationSchema extends BaseForm {
  subtype: ActivitySubtypes.Observation_Plant_Aquatic;
  subtype_data: {
    adjacent_land_use: string[];
    entries: Array<{
      density: string;
      distribution: string;
      invasive_plant: string;
      life_stage: string;
      observation_type: string;
      sample_point_id: string;
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
    substrate_type: string[];
    water_use: string[];
    waterlevel_management: string[];
    shoreline_types: Array<{
      shoreline_type: string;
      percent_covered?: number;
    }>;
    context: {
      suitable_for_biocontrol: string;
    };
    waterbody_context: {
      inflow_permanent: string[];
      inflow_seasonal: string[];
      outflow_permanent: string[];
      outflow_seasonal: string[];
      access: string;
      colour: string;
      comment: string;
      max_depth_m?: number;
      name_gazetted: string;
      name_local: string;
      secchi_depth?: number;
      tidal_influence: string;
      type: string;
    };
  };
}
export type { AquaticPlantObservationSchema };
