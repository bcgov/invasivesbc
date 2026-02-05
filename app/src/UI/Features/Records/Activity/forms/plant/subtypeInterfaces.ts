import { ActivitySubtype } from 'sharedAPI';

interface BaseForm {
  subtype: ActivitySubtype;
  date: string;
  area_m: number;
  latitude: number;
  longitude: number;
  utm_zone: number;
  utm_easting: number;
  utm_northing: number;
  employer: string;
  funding_agency: Array<{ agency: string }>;
  jurisdictions: { percent_covered: number; jurisdiction: string }[];
  subtype_data: unknown;
  location_description: string;
  access_description: string;
  project_code: { description: string }[];
  comment: string;
}

/**
 * Subtype Specific Information for Terrestrial Plant Observations
 */
interface TerrestrialPlantObservationSchema extends BaseForm {
  subtype: ActivitySubtype.Observation_PlantTerrestrial;
  subtype_data: {
    entries: Array<{
      density: string;
      distribution: string;
      invasive_plant: string;
      life_stage: string;
      observation_type: string;
      voucher_specimen: string;
    }>;
    pretreatment_observation: string;
    research_observation: string;
    visible_well_nearby: string;
    aspect: string;
    slope_percent: string;
    soil_texture: string;
    specific_use: string;
    suitable_for_biocontrol_agent: string;
  };
}

/**
 * Subtype Specific Information for Aquatic Plant Observations
 */
interface AquaticPlantObservationSchema extends BaseForm {
  subtype: ActivitySubtype.Observation_PlantAquatic;
  subtype_data: {
    adjacent_land_use: string[];
    entries: Array<{
      density: string;
      distribution: string;
      invasive_plant: string;
      life_stage: string;
      observation_type: string;
      sample_point_id: string;
    }>;
    pretreatment_observation: string;
    substrate_type: string[];
    water_use: string[];
    waterlevel_management: string[];
    shoreline_types: Array<{
      shoreline_type: string;
      percent_covered: number;
    }>;

    inflow_permanent: string[];
    inflow_seasonal: string[];
    outflow_permanent: string[];
    outflow_seasonal: string[];
    access: string;
    colour: string;
    comment: string;
    max_depth_m: number;
    name_gazetted: string;
    name_local: string;
    suitable_for_biocontrol: string;
    secchi_depth: number;
    tidal_influence: string;
    type: string;
  };
}

type FormSchema = BaseForm | TerrestrialPlantObservationSchema | AquaticPlantObservationSchema;

export type { FormSchema, AquaticPlantObservationSchema, TerrestrialPlantObservationSchema };
