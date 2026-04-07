import { SubtypeData } from 'constants';
import NearestWells from './NearestWells';
import TextInput from 'common-components/inputs/TextInput';
import Fieldset from 'common-components/inputs/Fieldset';

const ChemTreatmentInfo = ({ subtypeData }: SubtypeData) => {
  return (
    <>
      <NearestWells data={subtypeData?.well_entries} />
      <Fieldset label={'Treatment Context'}>
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
      </Fieldset>
      <Fieldset label={'Pest injury threshold Determination'}>
        <TextInput value={subtypeData?.pest_injury_threshold_determination_bool ? 'Yes' : 'No'} />
      </Fieldset>
      <Fieldset label={'Chem Treatment Details'}>
        <TextInput label={'Tank Mix'} value={subtypeData.detail?.tank_mix ? 'Yes' : 'No'} />
        <TextInput label={'Chemical Application Method'} value={subtypeData.detail?.chemical_application_method} />
        <TextInput label={'calculation type'} value={subtypeData.detail?.calculation_result?.calculation_type} />
        <TextInput label={'area treated sqm'} value={subtypeData.detail?.calculation_result?.area_treated_sqm} />
        <TextInput
          label={'percent area covered'}
          value={subtypeData.detail?.calculation_result?.percent_area_covered}
        />
        <TextInput
          label={'amount of undiluted herbicide used (l)'}
          value={subtypeData.detail?.calculation_result?.amount_of_undiluted_herbicide_used_liters}
        />
        <TextInput label={'Dilution'} value={subtypeData.detail?.calculation_result?.dilution} />
        <TextInput
          label={'skip application rate validation'}
          value={subtypeData?.detail?.skip_application_rate_validation ? 'Yes' : 'No'}
        />
      </Fieldset>
      <Fieldset label={'Calculation Results'}>
        <TextInput label={'tank mix details'} value={subtypeData?.detail?.tank_mix_details} />
        <TextInput
          label={'legacy object had error flag set?'}
          value={subtypeData?.detail?.legacy_object_had_error_flag_set ? 'Yes' : 'No'}
        />
        {subtypeData.detail?.calculation_result?.per_plant_calculations?.length > 0 && (
          <Fieldset label={'Per Plant calculations'}>
            <table>
              <thead>
                <tr>
                  {Object.keys(subtypeData.detail.calculation_result.per_plant_calculations[0]).map((k) => (
                    <th>{k.replaceAll('_', ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subtypeData.detail?.calculation_result?.per_plant_calculations.map((r) => (
                  <tr>
                    {Object.entries(r).map(([k, v]) => (
                      <td key={k}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Fieldset>
        )}
        <Fieldset label={'Invasive Plants'} small>
          {[
            ...(subtypeData?.detail?.terrestrial_invasive_plants ?? []),
            ...(subtypeData?.detail?.aquatic_invasive_plants ?? [])
          ].map((p) => (
            <div className="group-wrap" key={p.index}>
              <TextInput label={'Index'} value={p.index} />
              <TextInput label={'Invasive Plant'} value={p.invasive_plant} />
              <TextInput label={'Area Covered %'} value={p.percent_area_covered} />
            </div>
          ))}
        </Fieldset>
        <Fieldset label={'Herbicides'} small>
          {subtypeData?.detail?.herbicides?.map((h) => (
            <div className="group-wrap" key={h.index}>
              <TextInput label={'index'} value={h.index} />
              <TextInput label={'dilution'} value={h.dilution} />
              <TextInput label={'amount of mix'} value={h.amount_of_mix} />
              <TextInput label={'herbicide type'} value={h.herbicide_type} />
              <TextInput label={'liquid herbicide'} value={h.liquid_herbicide} />
              <TextInput label={'granular herbicide'} value={h.granular_herbicide} />
            </div>
          ))}
        </Fieldset>
        {subtypeData.detail?.calculation_result?.per_herbicide_calculations?.length > 0 && (
          <Fieldset label={'Per Herbicide Calculations'}>
            <table>
              <thead>
                <tr>
                  {Object.keys(subtypeData.detail.calculation_result.per_herbicide_calculations[0]).map((k) => (
                    <th key={k}>{k.replaceAll('_', ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subtypeData.detail?.calculation_result?.per_herbicide_calculations.map((r) => (
                  <tr>
                    {Object.entries(r).map(([k, v]) => (
                      <td key={k}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Fieldset>
        )}
      </Fieldset>
    </>
  );
};

export default ChemTreatmentInfo;
