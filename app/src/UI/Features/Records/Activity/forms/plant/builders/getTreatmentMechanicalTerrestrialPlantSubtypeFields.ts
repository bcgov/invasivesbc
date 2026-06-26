import { TerrestrialMechTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';

const getTreatmentMechanicalTerrestrialPlantSubtypeFields = (): TerrestrialMechTreatment['subtype_data'] => ({
  entries: [
    {
      disposed_material_amount: undefined,
      disposed_material_format: '',
      disposal_method: '',
      invasive_plant: '',
      mechanical_method: '',
      treated_area_msq: 0
    }
  ]
});

export default getTreatmentMechanicalTerrestrialPlantSubtypeFields;
