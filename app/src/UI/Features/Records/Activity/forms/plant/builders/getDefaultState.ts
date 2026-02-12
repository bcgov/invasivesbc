import { ActivitySubtypes } from 'sharedAPI';
import { AquaticPlantObservationSchema, FormSchema, TerrestrialPlantObservationSchema } from '../interfaces';

/**
 * @desc Creates empty subtype fields for ObservationPlantTerrestrial
 * Used for Form Creation/Reset
 */
const getObservationPlantTerrestrialSubtypeFields = (): TerrestrialPlantObservationSchema['subtype_data'] => ({
  entries: [
    {
      density: '',
      distribution: '',
      invasive_plant: '',
      life_stage: '',
      observation_type: '',
      voucher_specimen: undefined
    }
  ],
  pretreatment_observation: '',
  research_observation: '',
  visible_well_nearby: '',
  aspect: '',
  slope_percent: '',
  soil_texture: '',
  specific_use: '',
  suitable_for_biocontrol_agent: ''
});

/**
 * @desc Creates empty subtype fields for ObservationPlantAquatic
 * Used for Form Creation/Reset
 */
const getObservationPlantAquaticSubtypeFields = (): AquaticPlantObservationSchema['subtype_data'] => ({
  adjacent_land_use: [''],
  entries: [
    {
      density: '',
      distribution: '',
      invasive_plant: '',
      life_stage: '',
      observation_type: '',
      sample_point_id: ''
    }
  ],
  pretreatment_observation: '',
  substrate_type: [''],
  water_use: [''],
  waterlevel_management: [''],
  shoreline_types: [
    {
      shoreline_type: '',
      percent_covered: 0
    }
  ],
  inflow_permanent: [''],
  inflow_seasonal: [''],
  outflow_permanent: [''],
  outflow_seasonal: [''],
  access: '',
  colour: '',
  comment: '',
  max_depth_m: 0,
  name_gazetted: '',
  name_local: '',
  suitable_for_biocontrol: '',
  secchi_depth: 0,
  tidal_influence: '',
  type: ''
});
/**
 * @desc Intermediate function to map subtypes to their proper empty values
 * @param subtype Subtype to create
 */
const getSubtypeData = (subtype: ActivitySubtypes): FormSchema['subtype_data'] => {
  switch (subtype) {
    case ActivitySubtypes.Observation_Plant_Terrestrial:
      return getObservationPlantTerrestrialSubtypeFields();
    case ActivitySubtypes.Observation_Plant_Aquatic:
      return getObservationPlantAquaticSubtypeFields();
    case ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic:
    case ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic:
    case ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial:
    case ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial:
    case ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic:
    case ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial:
    case ActivitySubtypes.Treatment_Chemical_Plant_Aquatic:
    case ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial:
    case ActivitySubtypes.Biocontrol_Collection:
    case ActivitySubtypes.Biocontrol_Release:
    default:
      return getObservationPlantTerrestrialSubtypeFields();
  }
};

/**
 * Get the default values needed for a form, used for form create/reset logic.
 */
const getDefaultFormState = (
  subtype: ActivitySubtypes = ActivitySubtypes.Observation_Plant_Terrestrial
): FormSchema => {
  const subtype_data = getSubtypeData(subtype);
  return {
    date: new Date(),
    employer: '',
    subtype: subtype,
    funding_agencies: [{ invasive_species_agency_code: '' }],
    jurisdictions: [{ jurisdiction: '', percent_covered: 0 }],
    projects: [{ description: '' }],
    location_description: '',
    access_description: '',
    comment: '',
    area_m: 0,
    geom: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: {}
    },
    latitude: 0,
    longitude: 0,
    utm_zone: 0,
    utm_easting: 0,
    utm_northing: 0,
    linked_activities: [],
    subtype_data: subtype_data
  };
};

export default getDefaultFormState;
