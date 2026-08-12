import { SubtypeData } from 'constants';
import NearestWells from './NearestWells';
import TextInput from 'common-components/inputs/TextInput';
import Fieldset from 'common-components/inputs/Fieldset';

const ChemTreatmentInfo = ({ subtypeData }: SubtypeData) => {
  const { context, treatment_context } = subtypeData;

  return (
    <>
      <NearestWells data={subtypeData?.well_entries} />
      <Fieldset label={'Treatment Context'}>
        <TextInput label={'service license number'} value={context?.pesticide_employer_code} />
        <TextInput label={'pesticide use permit'} value={context?.pesticide_use_permit} />
        <TextInput label={'pest management plan'} value={context?.pest_management_plan} />
        <TextInput label={'pest management plan manual'} value={context?.pest_management_plan_manual} />
        <TextInput label={'temperature (c)'} value={context?.temperature_c} />
        <TextInput label={'wind speed kmh'} value={context?.wind_speed_kmh} />
        <TextInput label={'application start time'} value={context?.application_start_time} />
        <TextInput label={'wind direction'} value={context?.wind_direction} />
        <TextInput label={'humidity'} value={context?.humidity} />
        <TextInput label={'treatment notice signs'} value={context?.treatment_notice_signs} />
        <TextInput label={'precautionary statement'} value={context?.precautionary_statement} />
        <TextInput label={'ntz reduction'} value={context?.ntz_reduction ? 'Yes' : 'No'} />
        <TextInput label={'rationale for ntz reduction'} value={context?.rationale_for_ntz_reduction} />
        <TextInput
          label={'additional unmapped well water'}
          value={subtypeData?.additional_unmapped_well_water ? 'Yes' : 'No'}
        />
        <Fieldset label="Invasive Plants" small>
          {treatment_context.plants_treated.map((pt) => (
            <div className="group-wrap">
              <TextInput label="invasive plant" value={pt?.invasive_plant} />
              <TextInput label="Percent Covered" value={pt.percent_covered} />
            </div>
          ))}
        </Fieldset>
        <Fieldset label="Herbicides" small>
          {treatment_context.herbicide.map(({ type, name, application_rate }) => (
            <div className="group-wrap">
              <TextInput label="Herbicide Type" value={type} />
              <TextInput label="Herbicide Name" value={name} />
              <TextInput label="Application Rate" value={application_rate} />
            </div>
          ))}
        </Fieldset>
        <TextInput label="Amount of Mix Used L" value={treatment_context?.amount_of_mix_used_l} />
        <TextInput label="Application Method" value={treatment_context?.application_method} />
        <TextInput label="Area Treated SQM" value={treatment_context?.area_treated_sqm} />
        <TextInput label="Calculation Type" value={treatment_context?.calculation_type} />
        <TextInput label="Delivery Rate" value={treatment_context?.delivery_rate} />
        <TextInput label="Dilution Percent" value={treatment_context?.dilution_percent} />
        <TextInput label="Tank Mix?" value={treatment_context?.tank_mix ? 'Yes' : 'No'} />
      </Fieldset>
    </>
  );
};

export default ChemTreatmentInfo;
