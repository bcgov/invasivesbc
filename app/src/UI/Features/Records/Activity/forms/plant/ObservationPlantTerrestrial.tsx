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
        <SingleSelect
          label={'Soil Texture'}
          options={codes?.SoilTextureCode}
          error={errors?.subtype_data?.soil_texture}
          {...register('subtype_data.soil_texture')}
        />
        <SingleSelect
          label={'Specific Use'}
          options={codes?.SpecificUseCode}
          error={errors?.subtype_data?.specific_use}
          {...register('subtype_data.specific_use', { required: true })}
        />
        <SingleSelect
          label={'Slope (%)'}
          options={codes?.SlopePercentCode}
          error={errors?.subtype_data?.slope_percent}
          {...register('subtype_data.slope_percent', { required: true })}
        />
        <SingleSelect
          label={'Aspect'}
          options={codes?.AspectCode}
          error={errors?.subtype_data?.aspect}
          {...register('subtype_data.aspect', { required: true })}
        />
        <SingleSelect
          label={'Research Observation'}
          options={YesNoUnknown}
          error={errors?.subtype_data?.research_observation}
          {...register('subtype_data.research_observation', { required: true })}
        />
        <SingleSelect
          label={'Visible Well Nearby'}
          options={YesNoUnknown}
          error={errors?.subtype_data?.visible_well_nearby}
          {...register('subtype_data.visible_well_nearby', { required: true })}
        />
        <SingleSelect
          label={'Suitable For Biocontrol Agent'}
          options={YesNoUnknown}
          error={errors?.subtype_data?.suitable_for_biocontrol_agent}
          {...register('subtype_data.suitable_for_biocontrol_agent', { required: true })}
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
              error={errors?.subtype_data?.entries?.[index]?.invasive_plant}
              {...register(`subtype_data.entries.${index}.invasive_plant`, { required: true })}
            />
            <SingleSelect
              label={'Observation Type'}
              options={ObservationType}
              error={errors?.subtype_data?.entries?.[index]?.observation_type}
              {...register(`subtype_data.entries.${index}.observation_type`, { required: true })}
            />
            <SingleSelect
              label={'Density (plants/m2)'}
              options={codes?.DensityCode}
              error={errors?.subtype_data?.entries?.[index]?.density}
              {...register(`subtype_data.entries.${index}.density`, { required: true })}
            />
            <SingleSelect
              label={'Distribution'}
              options={codes?.DistributionCode}
              error={errors?.subtype_data?.entries?.[index]?.distribution}
              {...register(`subtype_data.entries.${index}.distribution`, { required: true })}
            />
            <SingleSelect
              label={'Life Stage'}
              options={codes?.PlantLifeStageCode}
              error={errors?.subtype_data?.entries?.[index]?.life_stage}
              {...register(`subtype_data.entries.${index}.life_stage`, { required: true })}
            />
            <SingleSelect
              label={'Voucher Specimen Collected'}
              options={YesNo}
              error={errors?.subtype_data?.entries?.[index]?.invasive_plant}
            />
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
