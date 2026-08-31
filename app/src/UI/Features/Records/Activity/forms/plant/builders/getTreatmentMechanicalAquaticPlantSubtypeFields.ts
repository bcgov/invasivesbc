import { AquaticMechTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';

const getTreatmentMechanicalAquaticPlantSubtypeFields = (): AquaticMechTreatment['subtype_data'] => ({
  entries: [
    {
      disposed_material_amount: NaN,
      disposed_material_format: '',
      disposal_method: '',
      invasive_plant: '',
      mechanical_method: '',
      treated_area_msq: NaN
    }
  ],
  shoreline_types: [
    {
      shoreline_type: '',
      percent_covered: NaN
    }
  ],
  authorization_information: ''
});

export default getTreatmentMechanicalAquaticPlantSubtypeFields;
