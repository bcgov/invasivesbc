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
import MultiSelect from '../common/MultiSelect/MultiSelect';
import { minArrayLength } from '../common/validators';

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
          name={'subtype_data.type'}
          rules={{ required: true }}
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
        <MultiSelect
          label={'Waterbody Use'}
          options={codes?.WaterbodyUseCode}
          name={'subtype_data.water_use'}
          rules={{ validate: (val) => minArrayLength(val, 1) }}
        />
        <MultiSelect
          label={'Water Level Management'}
          options={WaterLevelManagement}
          rules={{ validate: (val) => minArrayLength(val, 1) }}
          name={'subtype_data.waterlevel_management'}
        />
        <MultiSelect
          label={'Substrate Type'}
          options={codes?.SubstrateCode}
          name={'subtype_data.substrate_type'}
          rules={{ validate: (val) => minArrayLength(val, 1) }}
        />
        <SingleSelect
          label={'Tidal Influence'}
          options={YesNoUnknown}
          name={'subtype_data.tidal_influence'}
          rules={{ required: true }}
        />
        <MultiSelect
          label={'Adjacent Land Use'}
          options={codes?.AdjacentLandUseCode}
          name={'subtype_data.adjacent_land_use'}
        />
        <MultiSelect
          label={'Inflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          name={'subtype_data.inflow_permanent'}
        />
        <MultiSelect
          label={'Inflow (Temp. or Seasonal)'}
          options={codes?.WaterbodyFlowSeasonalCode}
          name={'subtype_data.inflow_seasonal'}
        />
        <MultiSelect
          label={'Outflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          name={'subtype_data.outflow_permanent'}
        />
        <MultiSelect
          label={'Outflow (Seasonal)'}
          options={codes?.WaterbodyFlowCode}
          name={'subtype_data.outflow_seasonal'}
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
              name={`subtype_data.shoreline_types.${index}.shoreline_type`}
              rules={{ required: true }}
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
        name={'subtype_data.suitable_for_biocontrol'}
        rules={{ required: true }}
      />

      {/* Aquatic Plant Entries Start */}
      <ArrayField<AquaticPlantObservationSchema>
        name="subtype_data.entries"
        label={'Aquatic Invasive Plant Information'}
        emptyValue={{}}
        renderRow={(index, remove) => (
          <>
            <TextInput
              label={'Sample Point ID'}
              error={errors?.subtype_data?.entries?.[index]?.sample_point_id}
              {...register(`subtype_data.entries.${index}.sample_point_id`)}
            />
            <SingleSelect
              label={'Invasive Plant'}
              options={codes?.AquaticPlantCode}
              name={`subtype_data.entries.${index}.invasive_plant`}
            />
            <SingleSelect
              label={'Observation Type'}
              options={ObservationType}
              name={`subtype_data.entries.${index}.observation_type`}
            />
            <SingleSelect
              label={'Density (plants/m2)'}
              options={codes?.DensityCode}
              name={`subtype_data.entries.${index}.density`}
            />
            <SingleSelect
              label={'Distribution'}
              options={codes?.DistributionCode}
              name={`subtype_data.entries.${index}.distribution`}
            />
            <SingleSelect
              label={'Life Stage'}
              options={codes?.PlantLifeStageCode}
              name={`subtype_data.entries.${index}.life_stage`}
            />
            {/* <SingleSelect label={'Voucher Specimen Collected'} options={YesNo}/> */}

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
