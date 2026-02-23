import { AquaticMechTreatment } from '../interfaces/AquaticMechTreatment';

const getTreatmentMechanicalAquaticPlantSubtypeFields = (): AquaticMechTreatment['subtype_data'] => ({
  entries: [
    {
      disposed_material_amount: 0,
      disposed_material_format: '',
      disposal_method: '',
      invasive_plant: '',
      mechanical_method: '',
      treated_area_msq: 0
    }
  ],
  shoreline_types: [
    {
      shoreline_type: '',
      percent_covered: 0
    }
  ],
  authorization_info: ''
});

export default getTreatmentMechanicalAquaticPlantSubtypeFields;
