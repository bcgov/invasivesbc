import {
  AquaticChemicalTreatmentSchema,
  TerrestrialChemicalTreatmentSchema
} from 'UI/Features/Records/Activity/forms/plant/interfaces/';

type ChemTreatment = AquaticChemicalTreatmentSchema | TerrestrialChemicalTreatmentSchema;

const getTreatmentChemicalPlantSubtypeFields = (): ChemTreatment['subtype_data'] => ({
  well_entries: [],
  service_license_number: '',
  pesticide_use_permit: '',
  pest_management_plan: '',
  pest_management_plan_manual: '',
  temperature_c: undefined,
  wind_speed_kmh: undefined,
  application_start_time: '',
  wind_direction: '',
  humidity: undefined,
  treatment_notice_signs: '',
  precautionary_statement: '',
  ntz_reduction_bool: false,
  rationale_for_ntz_reduction: '',
  additional_unmapped_well_water_bool: false,
  pest_injury_threshold_determination_bool: true,
  treatment_context: {
    tank_mix: false,
    application_method: '',
    calculation_type: '',
    herbicide: [],
    plants_treated: [{ invasive_plant: '', percent_covered: 100 }]
  }
});

export default getTreatmentChemicalPlantSubtypeFields;
