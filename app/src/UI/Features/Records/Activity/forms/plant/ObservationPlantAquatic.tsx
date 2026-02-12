import { useSelector } from 'utils/use_selector';
import Fieldset from '../common/Fieldset/Fieldset';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import { WaterbodyType, WaterLevelManagement, YesNoUnknown } from '../enums';
import TextInput from '../common/TextInput/TextInput';
import TextArea from '../common/TextArea/TextArea';
import ArrayField from '../common/ArrayField/ArrayField';
import NumberInput from '../common/NumberInput/NumberInput';
import { useFormContext } from 'react-hook-form';
import MultiSelect from '../common/MultiSelect/MultiSelect';
import { minArrayLength, noRepeatKey } from '../common/validators';
import { Width } from '../common/utils';
import DeleteControl from '../common/DeleteControl/DeleteControl';
import { AquaticPlantObservationSchema } from './interfaces';
import AquaticPlantEntry from './subtype-component/AquaticPlantEntry';
import tooltips from './content/tooltips';
import getDefaultFormState from './builders/getDefaultState';
import { ActivitySubtypes } from 'sharedAPI';

const ObservationPlantAquatic = () => {
  const ROOT = 'subtype_data';
  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const {
    register,
    formState: { errors, disabled }
  } = useFormContext<AquaticPlantObservationSchema>();

  return (
    <>
      {/* Waterbody Data Start */}
      <Fieldset label={'Waterbody Data'}>
        <SingleSelect
          label={'Waterbody Type'}
          options={WaterbodyType}
          tooltip={tooltips.plant.waterbody.type}
          required
          name={'subtype_data.type'}
          rules={{ required: true }}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Name (Gazetted)'}
          tooltip={tooltips.plant.waterbody.name_gazetted}
          error={errors?.subtype_data?.name_gazetted}
          {...register('subtype_data.name_gazetted')}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Name (Local)'}
          tooltip={tooltips.plant.waterbody.name_local}
          error={errors?.subtype_data?.name_local}
          {...register('subtype_data.name_local')}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Access'}
          tooltip={tooltips.plant.waterbody.access}
          error={errors?.subtype_data?.access}
          {...register('subtype_data.access')}
          width={Width.Half}
        />
        <MultiSelect
          label={'Waterbody Use'}
          tooltip={tooltips.plant.waterbody.use}
          options={codes?.WaterbodyUseCode}
          name={'subtype_data.water_use'}
          required
          rules={{ required: true, validate: (val) => minArrayLength(val, 1) }}
          width={Width.Half}
        />
        <MultiSelect
          label={'Water Level Management'}
          tooltip={tooltips.plant.waterbody.waterlevel_management}
          options={WaterLevelManagement}
          required
          rules={{ required: true, validate: (val) => minArrayLength(val, 1) }}
          name={'subtype_data.waterlevel_management'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Substrate Type'}
          options={codes?.SubstrateCode}
          tooltip={tooltips.plant.waterbody.substrate_type}
          name={'subtype_data.substrate_type'}
          required
          rules={{ required: true, validate: (val) => minArrayLength(val, 1) }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Tidal Influence'}
          tooltip={tooltips.plant.waterbody.tidal_influence}
          options={YesNoUnknown}
          name={'subtype_data.tidal_influence'}
          required
          rules={{ required: true }}
          width={Width.Half}
        />
        <MultiSelect
          label={'Adjacent Land Use'}
          tooltip={tooltips.plant.waterbody.adjancent_land_use}
          options={codes?.AdjacentLandUseCode}
          name={'subtype_data.adjacent_land_use'}
          width={Width.Half}
        />
        <MultiSelect
          tooltip={tooltips.plant.waterbody.inflow}
          label={'Inflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          name={'subtype_data.inflow_permanent'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Inflow (Temp. or Seasonal)'}
          tooltip={tooltips.plant.waterbody.inflow}
          options={codes?.WaterbodyFlowSeasonalCode}
          name={'subtype_data.inflow_seasonal'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Outflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          tooltip={tooltips.plant.waterbody.outflow}
          name={'subtype_data.outflow_permanent'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Outflow (Seasonal)'}
          options={codes?.WaterbodyFlowCode}
          tooltip={tooltips.plant.waterbody.outflow}
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
      <ArrayField<AquaticPlantObservationSchema, 'subtype_data.shoreline_types'>
        name="subtype_data.shoreline_types"
        label={'Shoreline Types'}
        emptyValue={{}}
        renderRow={(index, remove) => (
          <>
            <SingleSelect
              label={'Shoreline Type'}
              tooltip={tooltips.plant.waterbody.shoreline_type}
              options={codes?.ShorelineTypeCode}
              name={`subtype_data.shoreline_types.${index}.shoreline_type`}
              required
              rules={{ required: true }}
              width={Width.Half}
            />
            <NumberInput
              tooltip={tooltips.plant.waterbody.shoreline_percent}
              label={'Percent Covered (%)'}
              error={errors?.subtype_data?.shoreline_types?.[index]?.percent_covered}
              {...register(`subtype_data.shoreline_types.${index}.percent_covered`)}
              width={Width.Half}
            />
            <DeleteControl disabled={disabled} onClick={() => remove(index)} />
          </>
        )}
      />

      {/* Water Quality Start */}
      <Fieldset label={'Water Quality'}>
        <NumberInput
          label="Maximum Depth (m)"
          tooltip={tooltips.plant.waterbody.depth}
          error={errors?.subtype_data?.max_depth_m}
          {...register('subtype_data.max_depth_m')}
          width={Width.Half}
        />
        <NumberInput
          label="Secchi Depth (m)"
          tooltip={tooltips.plant.waterbody.secchi_depth}
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
          tooltip={tooltips.plant.suitable_for_biocontrol_agent}
          name={'subtype_data.suitable_for_biocontrol'}
          required
          rules={{ required: true }}
        />
      </Fieldset>

      {/* Aquatic Plant Entries Start */}
      <ArrayField<AquaticPlantObservationSchema, 'subtype_data.entries'>
        name="subtype_data.entries"
        label={'Aquatic Invasive Plant Information'}
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1),
            noRepeatPlants: (val) => noRepeatKey(val, 'invasive_plant', 'Invasive Plant')
          }
        }}
        // Use builder to get empty entry. Less optimal but keeps declarations in one spot.
        emptyValue={getDefaultFormState(ActivitySubtypes.Observation_Plant_Aquatic).subtype_data.entries[0]}
        renderRow={(index, remove) => <AquaticPlantEntry root={ROOT} index={index} remove={remove} />}
      />
    </>
  );
};

export default ObservationPlantAquatic;
