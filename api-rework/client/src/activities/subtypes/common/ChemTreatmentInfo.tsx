import { SubtypeData } from 'constants';
import NearestWells from './NearestWells';
import TextInput from 'common-components/inputs/TextInput';
import Fieldset from 'common-components/inputs/Fieldset';

const ChemTreatmentInfo = ({ subtypeData }: SubtypeData) => {
  return (
    <>
      <NearestWells data={subtypeData?.well_entries} />
      <div className="group-wrap">
        <TextInput label={'service license number'} value={subtypeData?.context?.pesticide_employer_code} />
        <TextInput label={'pesticide use permit'} value={subtypeData?.context?.pesticide_use_permit} />
        <TextInput label={'pest management plan'} value={subtypeData?.context?.pest_management_plan} />
        <TextInput label={'pest management plan manual'} value={subtypeData?.context?.pest_management_plan_manual} />
        <TextInput label={'temperature (c)'} value={subtypeData?.context?.temperature_c} />
        <TextInput label={'wind speed kmh'} value={subtypeData?.context?.wind_speed_kmh} />
        <TextInput label={'application start time'} value={subtypeData?.context?.application_start_time} />
        <TextInput label={'wind direction'} value={subtypeData?.context?.wind_direction} />
        <TextInput label={'humidity'} value={subtypeData?.context?.humidity} />
        <TextInput label={'treatment notice signs'} value={subtypeData?.context?.treatment_notice_signs} />
        <TextInput label={'precautionary statement'} value={subtypeData?.context?.precautionary_statement} />
        <TextInput label={'ntz reduction'} value={subtypeData?.context?.ntz_reduction_bool ? 'Yes' : 'No'} />
        <TextInput label={'rationale for ntz reduction'} value={subtypeData?.context?.rationale_for_ntz_reduction} />
        <TextInput
          label={'additional unmapped well water'}
          value={subtypeData?.additional_unmapped_well_water_bool ? 'Yes' : 'No'}
        />
      </div>
      <Fieldset label={'Pest injury threshold Determination'}>
        <TextInput value={subtypeData?.pest_injury_threshold_determination_bool ? 'Yes' : 'No'} />
      </Fieldset>
    </>
  );
};

export default ChemTreatmentInfo;
