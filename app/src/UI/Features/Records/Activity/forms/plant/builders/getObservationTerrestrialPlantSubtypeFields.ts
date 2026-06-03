import { TerrestrialPlantObservationSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces/TerrestrialObservation';

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
  context: {
    research_observation: '',
    visible_well_nearby: '',
    aspect: '',
    slope_percent: '',
    soil_texture: '',
    specific_uses: [],
    suitable_for_biocontrol_agent: ''
  }
});

export default getObservationPlantTerrestrialSubtypeFields;
