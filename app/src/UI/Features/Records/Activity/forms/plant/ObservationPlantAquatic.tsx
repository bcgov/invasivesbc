import { useSelector } from 'utils/use_selector';
import Fieldset from '../common/Fieldset/Fieldset';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import { ObservationType, WaterbodyType, WaterLevelManagement, YesNo, YesNoUnknown } from '../enums';
import TextInput from '../common/TextInput/TextInput';
import TextArea from '../common/TextArea/TextArea';
import ArrayField from '../common/ArrayField/ArrayField';
import NumberInput from '../common/NumberInput/NumberInput';
import { useFormContext } from 'react-hook-form';
import { AquaticPlantObservationSchema } from './subtypeInterfaces';

const ObservationPlantAquatic = () => {
  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const {
    register,
    formState: { errors }
  } = useFormContext<AquaticPlantObservationSchema>();

  return (
    <>
      {/* Waterbody Data Start */}
      <Fieldset label={'Waterbody Data'}>
        <SingleSelect
          label={'Waterbody Type'}
          options={WaterbodyType}
          error={errors?.subtype_data?.type}
          {...register('subtype_data.type', { required: true })}
        />
        <TextInput
          label={'Waterbody Name (Gazetted)'}
          error={errors?.subtype_data?.name_gazetted}
          {...register('subtype_data.name_gazetted')}
        />
        <TextInput
          label={'Waterbody Name (Local)'}
          error={errors?.subtype_data?.name_local}
          {...register('subtype_data.name_local')}
        />
        <TextInput
          label={'Waterbody Access'}
          error={errors?.subtype_data?.access}
          {...register('subtype_data.access')}
        />
        <SingleSelect
          label={'Waterbody Use'}
          options={codes?.WaterbodyUseCode}
          error={errors?.subtype_data?.water_use}
          {...register('subtype_data.water_use')}
        />
        <SingleSelect
          label={'Water Level Management'}
          options={WaterLevelManagement}
          error={errors?.subtype_data?.waterlevel_management}
          {...register('subtype_data.waterlevel_management')}
        />
        <SingleSelect
          label={'Substrate Type'}
          options={codes?.SubstrateCode}
          error={errors?.subtype_data?.substrate_type}
          {...register('subtype_data.subtrate_type')}
        />
        <SingleSelect
          label={'Tidal Influence'}
          options={YesNoUnknown}
          error={errors?.subtype_data?.tidal_influence}
          {...register('subtype_data.tidal_influence')}
        />
        <SingleSelect
          label={'Adjacent Land Use'}
          options={codes?.AdjacentLandUseCode}
          error={errors?.subtype_data?.adjacent_land_use}
          {...register('subtype_data.adjacent_land_use')}
        />
        <SingleSelect
          label={'Inflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          error={errors?.subtype_data?.inflow_permanent}
          {...register('subtype_data.inflow_permanent')}
        />
        <SingleSelect
          label={'Inflow (Temp. or Seasonal)'}
          options={codes?.WaterbodyFlowSeasonalCode}
          error={errors?.subtype_data?.inflow_seasonal}
          {...register('subtype_data.inflow_seasonal')}
        />
        <SingleSelect
          label={'Outflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          error={errors?.subtype_data?.outflow_permanent}
          {...register('subtype_data.outflow_permanent')}
        />
        <SingleSelect
          label={'Outflow (Seasonal)'}
          options={codes?.WaterbodyFlowCode}
          error={errors?.subtype_data?.outflow_seasonal}
          {...register('subtype_data.outflow_seasonal')}
        />
        <TextArea label={'Comment'} error={errors?.subtype_data?.comment} {...register('subtype_data.comment')} />
      </Fieldset>

      {/* Shoreline Types Start */}
      <ArrayField<AquaticPlantObservationSchema>
        name="subtype_data.shoreline_types"
        label={'Shoreline Types'}
        emptyValue={{}}
        renderRow={(index, remove) => (
          <>
            <SingleSelect
              label={'Shoreline Type'}
              options={codes?.ShorelineTypeCode}
              error={errors?.subtype_data?.shoreline_types?.[index]?.shoreline_type}
              {...register(`subtype_data.shoreline_types.${index}.shoreline_type`)}
            />
            <NumberInput
              label={'Percent Covered (%)'}
              error={errors?.subtype_data?.shoreline_types?.[index]?.percent_covered}
              {...register(`subtype_data.shoreline_types.${index}.percent_covered`)}
            />
            <button type="button" className="delete" onClick={() => remove(index)}>
              Remove
            </button>
          </>
        )}
      />

      {/* Water Quality Start */}
      <Fieldset label={'Water Quality'}>
        <NumberInput
          label="Maximum Depth (m)"
          error={errors?.subtype_data?.max_depth_m}
          {...register('subtype_data.max_depth_m')}
        />
        <NumberInput
          label="Secchi Depth (m)"
          error={errors?.subtype_data?.secchi_depth}
          {...register('subtype_data.secchi_depth')}
        />
        <TextInput label="Water Colour" error={errors?.subtype_data?.colour} {...register('subtype_data.colour')} />
      </Fieldset>
      <SingleSelect
        label="Suitable For Biocontrol Agent(s)"
        options={YesNoUnknown}
        error={errors?.subtype_data?.shoreline_types?.[index]?.shoreline_type}
        {...register(`subtype_data.shoreline_types.${index}.shoreline_type`)}
      />

      {/* Aquatic Plant Entries Start */}
      <ArrayField<AquaticPlantObservationSchema>
        name="entries"
        label={'Aquatic Invasive Plant Information'}
        emptyValue={{}}
        renderRow={(index, remove) => (
          <>
            <TextInput
              label={'Sample Point ID'}
              error={errors?.subtype_data?.name_gazetted}
              {...register('subtype_data.name_gazetted')}
            />
            <SingleSelect
              label={'Invasive Plant'}
              options={codes?.AquaticPlantCode}
              error={errors?.subtype_data?.name_gazetted}
              {...register('subtype_data.name_gazetted')}
            />
            <SingleSelect
              label={'Observation Type'}
              options={ObservationType}
              error={errors?.subtype_data?.name_gazetted}
              {...register('subtype_data.name_gazetted')}
            />
            <SingleSelect
              label={'Density (plants/m2)'}
              options={codes?.DensityCode}
              error={errors?.subtype_data?.name_gazetted}
              {...register('subtype_data.name_gazetted')}
            />
            <SingleSelect
              label={'Distribution'}
              options={codes?.DistributionCode}
              error={errors?.subtype_data?.name_gazetted}
              {...register('subtype_data.name_gazetted')}
            />
            <SingleSelect
              label={'Life Stage'}
              options={codes?.PlantLifeStageCode}
              error={errors?.subtype_data?.name_gazetted}
              {...register('subtype_data.name_gazetted')}
            />
            <SingleSelect
              label={'Voucher Specimen Collected'}
              options={YesNo}
              error={errors?.subtype_data?.name_gazetted}
              {...register('subtype_data.name_gazetted')}
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

export default ObservationPlantAquatic;
