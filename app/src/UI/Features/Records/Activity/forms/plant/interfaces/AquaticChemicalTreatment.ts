import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from './BaseForm';

interface AquaticChemicalTreatmentSchema extends BaseForm {
  subtype: ActivitySubtypes.Treatment_Chemical_Plant_Aquatic;
  subtype_data: {
    well_entries: Array<{
      well_tag: string;
      distance: number;
    }>;
    entries: Array<unknown>;
    service_license_number: string;
    pesticide_use_permit: string;
    pest_management_plan: string;
    pest_management_plan_manual: string;
    temperature_c: number;
    wind_speed_kmh: number;
    application_start_time: string;
    wind_direction: string;
    humidity: number;
    treatment_notice_signs: string;
    precautionary_statement: string;
    ntz_reduction_bool: boolean;
    rationale_for_ntz_reduction?: string;
    additional_unmapped_well_water_bool: boolean;
    pest_injury_threshold_determination_bool: boolean;
  };
}

export type { AquaticChemicalTreatmentSchema };
