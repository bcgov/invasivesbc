import { ChemTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces/ChemTreatment';

const getTreatmentChemicalPlantSubtypeFields = (): ChemTreatment['subtype_data'] => ({
  well_entries: [],
  context: {
    pesticide_employer_code: '',
    pesticide_use_permit: '',
    pest_management_plan: '',
    pest_management_plan_manual: '',
    temperature_c: NaN,
    wind_speed_kmh: NaN,
    application_start_time: '',
    wind_direction: '',
    humidity: NaN,
    treatment_notice_signs: '',
    precautionary_statement: '',
    ntz_reduction: false,
    rationale_for_ntz_reduction: '',
    additional_unmapped_well_water: false,
    pest_injury_threshold_determination: true
  },
  treatment_context: {
    tank_mix: false,
    application_method: '',
    calculation_type: '',
    herbicide: [],
    plants_treated: [{ invasive_plant: '', percent_covered: 100 }]
  }
});

export default getTreatmentChemicalPlantSubtypeFields;
