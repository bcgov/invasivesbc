import { AquaticPlantObservationSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces/AquaticObservation';

/**
 * @desc Creates empty subtype fields for ObservationPlantAquatic
 * Used for Form Creation/Reset
 */
const getObservationAquaticPlantSubtypeFields = (): AquaticPlantObservationSchema['subtype_data'] => ({
  adjacent_land_use: [],
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
  substrate_type: [],
  water_use: [],
  waterlevel_management: [],
  shoreline_types: [
    {
      shoreline_type: '',
      percent_covered: undefined
    }
  ],
  context: {
    suitable_for_biocontrol: 'Unknown'
  },

  waterbody_context: {
    inflow_permanent: [],
    inflow_seasonal: [],
    outflow_permanent: [],
    outflow_seasonal: [],
    access: '',
    colour: '',
    comment: '',
    max_depth_m: undefined,
    name_gazetted: '',
    name_local: '',
    secchi_depth: undefined,
    tidal_influence: '',
    type: ''
  }
});

export default getObservationAquaticPlantSubtypeFields;
