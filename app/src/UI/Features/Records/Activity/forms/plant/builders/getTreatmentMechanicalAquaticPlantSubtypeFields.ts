import { AquaticMechTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';

const getTreatmentMechanicalAquaticPlantSubtypeFields = (): AquaticMechTreatment['subtype_data'] => ({
  entries: [
    {
      disposed_material_amount: undefined,
      disposed_material_format: '',
      disposal_method: '',
      invasive_plant: '',
      mechanical_method: '',
      treated_area_msq: undefined
    }
  ],
  shoreline_types: [
    {
      shoreline_type: '',
      percent_covered: undefined
    }
  ],
  authorization_information: ''
});

export default getTreatmentMechanicalAquaticPlantSubtypeFields;
