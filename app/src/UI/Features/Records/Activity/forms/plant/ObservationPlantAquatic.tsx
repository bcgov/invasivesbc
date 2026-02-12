import { useSelector } from 'utils/use_selector';
import Fieldset from '../common/Fieldset/Fieldset';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import { ObservationType, WaterbodyType, WaterLevelManagement, YesNo, YesNoUnknown } from '../enums';
import TextInput from '../common/TextInput/TextInput';
import TextArea from '../common/TextArea/TextArea';
import ArrayField from '../common/ArrayField/ArrayField';
import NumberInput from '../common/NumberInput/NumberInput';
import { useFormContext } from 'react-hook-form';
import MultiSelect from '../common/MultiSelect/MultiSelect';
import { minArrayLength } from '../common/validators';
import { Width } from '../common/utils';
import DeleteControl from '../common/DeleteControl/DeleteControl';
import { AquaticPlantObservationSchema } from './interfaces';

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
          required
          name={'subtype_data.type'}
          rules={{ required: true }}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Name (Gazetted)'}
          error={errors?.subtype_data?.name_gazetted}
          {...register('subtype_data.name_gazetted')}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Name (Local)'}
          error={errors?.subtype_data?.name_local}
          {...register('subtype_data.name_local')}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Access'}
          error={errors?.subtype_data?.access}
          {...register('subtype_data.access')}
          width={Width.Half}
        />
        <MultiSelect
          label={'Waterbody Use'}
          options={codes?.WaterbodyUseCode}
          name={'subtype_data.water_use'}
          rules={{ validate: (val) => minArrayLength(val, 1) }}
          width={Width.Half}
        />
        <MultiSelect
          label={'Water Level Management'}
          options={WaterLevelManagement}
          rules={{ validate: (val) => minArrayLength(val, 1) }}
          name={'subtype_data.waterlevel_management'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Substrate Type'}
          options={codes?.SubstrateCode}
          name={'subtype_data.substrate_type'}
          rules={{ validate: (val) => minArrayLength(val, 1) }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Tidal Influence'}
          options={YesNoUnknown}
          name={'subtype_data.tidal_influence'}
          required
          rules={{ required: true }}
          width={Width.Half}
        />
        <MultiSelect
          label={'Adjacent Land Use'}
          options={codes?.AdjacentLandUseCode}
          name={'subtype_data.adjacent_land_use'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Inflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          name={'subtype_data.inflow_permanent'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Inflow (Temp. or Seasonal)'}
          options={codes?.WaterbodyFlowSeasonalCode}
          name={'subtype_data.inflow_seasonal'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Outflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          name={'subtype_data.outflow_permanent'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Outflow (Seasonal)'}
          options={codes?.WaterbodyFlowCode}
          name={'subtype_data.outflow_seasonal'}
          width={Width.Half}
        />
        <TextArea
          label={'Comment'}
          error={errors?.subtype_data?.comment}
          {...register('subtype_data.comment')}
          width={Width.Half}
        />
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
              required
              rules={{ required: true }}
              width={Width.Half}
            />
            <NumberInput
              label={'Percent Covered (%)'}
              error={errors?.subtype_data?.shoreline_types?.[index]?.percent_covered}
              {...register(`subtype_data.shoreline_types.${index}.percent_covered`)}
              width={Width.Half}
            />
            <DeleteControl onClick={() => remove(index)} />
          </>
        )}
      />

      {/* Water Quality Start */}
      <Fieldset label={'Water Quality'}>
        <NumberInput
          label="Maximum Depth (m)"
          error={errors?.subtype_data?.max_depth_m}
          {...register('subtype_data.max_depth_m')}
          width={Width.Half}
        />
        <NumberInput
          label="Secchi Depth (m)"
          error={errors?.subtype_data?.secchi_depth}
          {...register('subtype_data.secchi_depth')}
          width={Width.Half}
        />
        <TextInput
          label="Water Colour"
          error={errors?.subtype_data?.colour}
          {...register('subtype_data.colour')}
          width={Width.Half}
        />
      </Fieldset>
      <Fieldset label={'Observation Information'}>
        <SingleSelect
          label="Suitable For Biocontrol Agent(s)"
          options={YesNoUnknown}
          name={'subtype_data.suitable_for_biocontrol'}
          required
          rules={{ required: true }}
        />
      </Fieldset>

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
              width={Width.Half}
            />
            <SingleSelect
              label={'Invasive Plant'}
              options={codes?.AquaticPlantCode}
              name={`subtype_data.entries.${index}.invasive_plant`}
              required
              rules={{ required: true }}
              width={Width.Half}
            />
            <SingleSelect
              label={'Observation Type'}
              options={ObservationType}
              required
              rules={{ required: true }}
              name={`subtype_data.entries.${index}.observation_type`}
              width={Width.Half}
            />
            <SingleSelect
              label={'Density (plants/m2)'}
              options={codes?.DensityCode}
              name={`subtype_data.entries.${index}.density`}
              width={Width.Half}
            />
            <SingleSelect
              label={'Distribution'}
              options={codes?.DistributionCode}
              name={`subtype_data.entries.${index}.distribution`}
              width={Width.Half}
            />
            <SingleSelect
              label={'Life Stage'}
              options={codes?.PlantLifeStageCode}
              name={`subtype_data.entries.${index}.life_stage`}
              width={Width.Half}
            />
            {/* <SingleSelect label={'Voucher Specimen Collected'} options={YesNo}/> */}
            <DeleteControl onClick={() => remove(index)} />
          </>
        )}
      />
    </>
  );
};

export default ObservationPlantAquatic;
