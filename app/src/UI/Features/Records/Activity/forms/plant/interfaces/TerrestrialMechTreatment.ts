import { ActivitySubtypes } from 'sharedAPI';
import { BaseForm } from './BaseForm';

interface TerrestrialMechTreatment extends BaseForm {
  subtype: ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial;
  subtype_data: {
    entries: Array<{
      disposed_material_amount?: number;
      disposed_material_format?: string;
      disposal_method: string;
      invasive_plant: string;
      mechanical_method: string;
      treated_area_msq: number;
    }>;
  };
}

export type { TerrestrialMechTreatment };
