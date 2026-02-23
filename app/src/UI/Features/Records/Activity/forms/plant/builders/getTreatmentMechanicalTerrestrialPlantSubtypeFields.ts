import { TerrestrialMechTreatment } from '../interfaces';

const getTreatmentMechanicalTerrestrialPlantSubtypeFields = (): TerrestrialMechTreatment['subtype_data'] => ({
  entries: [
    {
      disposed_material_amount: 0,
      disposed_material_format: '',
      disposal_method: '',
      invasive_plant: '',
      mechanical_method: '',
      treated_area_msq: 0
    }
  ]
});

export default getTreatmentMechanicalTerrestrialPlantSubtypeFields;
