import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from './BaseForm';

interface AquaticMechTreatment extends BaseForm {
  subtype: ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic;
  subtype_data: {
    entries: Array<{
      disposed_material_amount?: number;
      disposed_material_format?: string;
      disposal_method: string;
      invasive_plant: string;
      mechanical_method: string;
      treated_area_msq?: number;
    }>;
    authorization_information: string;
    shoreline_types: Array<{
      shoreline_type: string;
      percent_covered?: number;
    }>;
  };
}

export type { AquaticMechTreatment };
