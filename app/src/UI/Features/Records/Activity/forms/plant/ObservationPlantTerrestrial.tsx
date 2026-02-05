import { useSelector } from 'utils/use_selector';
import { useFormContext } from 'react-hook-form';
import Fieldset from '../common/Fieldset/Fieldset';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import { ObservationType, YesNo, YesNoUnknown } from '../enums';
import ArrayField from '../common/ArrayField/ArrayField';
import { FormSchema, TerrestrialPlantObservationSchema } from './subtypeInterfaces';

const ObservationPlantTerrestrial = () => {
  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const {
    register,
    formState: { errors }
  } = useFormContext<TerrestrialPlantObservationSchema>();

  return (
    <>
      {/* Observation Persons Goes Here */}
      <Fieldset label={'Observation Plant Terrestrial Information'}>
        <SingleSelect label={'Soil Texture'} options={codes?.SoilTextureCode} name={'subtype_data.soil_texture'} />
        <SingleSelect
          label={'Specific Use'}
          options={codes?.SpecificUseCode}
          name={'subtype_data.specific_use'}
          rules={{ required: true }}
        />
        <SingleSelect
          label={'Slope (%)'}
          options={codes?.SlopePercentCode}
          name={'subtype_data.slope_percent'}
          rules={{ required: true }}
        />
        <SingleSelect
          label={'Aspect'}
          options={codes?.AspectCode}
          name={'subtype_data.aspect'}
          rules={{ required: true }}
        />
        <SingleSelect
          label={'Research Observation'}
          options={YesNoUnknown}
          name={'subtype_data.research_observation'}
          rules={{ required: true }}
        />
        <SingleSelect
          label={'Visible Well Nearby'}
          options={YesNoUnknown}
          name={'subtype_data.visible_well_nearby'}
          rules={{ required: true }}
        />
        <SingleSelect
          label={'Suitable For Biocontrol Agent'}
          options={YesNoUnknown}
          name={'subtype_data.suitable_for_biocontrol_agent'}
          rules={{ required: true }}
        />
      </Fieldset>
      <ArrayField<FormSchema>
        name="subtype_data.entries"
        label={'Terrestrial Invasive Plants'}
        emptyValue={{ invasive_plant: '', observation_type: '', density: '', distribution: '', life_stage: '' }}
        renderRow={(index, remove) => (
          <>
            <SingleSelect
              label={'Invasive Plant'}
              options={codes?.TerrestrialPlantCode}
              name={`subtype_data.entries.${index}.invasive_plant`}
              rules={{ required: true }}
            />
            <SingleSelect
              label={'Observation Type'}
              options={ObservationType}
              name={`subtype_data.entries.${index}.observation_type`}
              rules={{ required: true }}
            />
            <SingleSelect
              label={'Density (plants/m2)'}
              options={codes?.DensityCode}
              name={`subtype_data.entries.${index}.density`}
              rules={{ required: true }}
            />
            <SingleSelect
              label={'Distribution'}
              options={codes?.DistributionCode}
              name={`subtype_data.entries.${index}.distribution`}
              rules={{ required: true }}
            />
            <SingleSelect
              label={'Life Stage'}
              options={codes?.PlantLifeStageCode}
              name={`subtype_data.entries.${index}.life_stage`}
              rules={{ required: true }}
            />
            {/* <SingleSelect
              label={'Voucher Specimen Collected'}
              options={YesNo}
              rules={{ required: true }}
            /> */}
            <button type="button" className="delete" onClick={() => remove(index)}>
              Remove
            </button>
          </>
        )}
      />
    </>
  );
};

export default ObservationPlantTerrestrial;
