import { TerrestrialMechTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';

const getTreatmentMechanicalTerrestrialPlantSubtypeFields = (): TerrestrialMechTreatment['subtype_data'] => ({
  entries: [
    {
      disposed_material_amount: NaN,
      disposed_material_format: '',
      disposal_method: '',
      invasive_plant: '',
      mechanical_method: '',
      treated_area_msq: NaN
    }
  ]
});

export default getTreatmentMechanicalTerrestrialPlantSubtypeFields;
