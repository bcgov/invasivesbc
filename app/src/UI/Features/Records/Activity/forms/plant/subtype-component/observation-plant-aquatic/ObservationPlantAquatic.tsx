import { useSelector } from 'utils/use_selector';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { WaterbodyType, WaterLevelManagement, YesNoUnknown } from 'UI/Features/Records/Activity/forms/enums';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { get, useFormContext } from 'react-hook-form';
import MultiSelect from 'UI/Features/Records/Activity/forms/common/MultiSelect/MultiSelect';
import { checkSum, minArrayLength, noRepeatKey } from 'UI/Features/Records/Activity/forms/common/validators';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { AquaticPlantObservationSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import AquaticPlantEntry from 'UI/Features/Records/Activity/forms/plant/subtype-component/observation-plant-aquatic/AquaticPlantEntry';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { ActivitySubtypes } from 'sharedAPI';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

const ObservationPlantAquatic = () => {
  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const { getPath } = useFieldPath<AquaticPlantObservationSchema>('subtype_data');
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
          tooltip={tooltips.plant.waterbody.type}
          required
          name={getPath('type')}
          rules={{ required: true }}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Name (Gazetted)'}
          tooltip={tooltips.plant.waterbody.name_gazetted}
          error={get(errors, getPath('name_gazetted'))}
          {...register(getPath('name_gazetted'))}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Name (Local)'}
          tooltip={tooltips.plant.waterbody.name_local}
          error={get(errors, getPath('name_local'))}
          {...register(getPath('name_local'))}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Access'}
          tooltip={tooltips.plant.waterbody.access}
          error={get(errors, getPath('access'))}
          {...register(getPath('access'))}
          width={Width.Half}
        />
        <MultiSelect
          label={'Waterbody Use'}
          tooltip={tooltips.plant.waterbody.use}
          options={codes?.WaterbodyUseCode}
          name={getPath('water_use')}
          width={Width.Half}
        />
        <MultiSelect
          label={'Water Level Management'}
          tooltip={tooltips.plant.waterbody.waterlevel_management}
          options={WaterLevelManagement}
          name={getPath('waterlevel_management')}
          width={Width.Half}
        />
        <MultiSelect
          label={'Substrate Type'}
          name={getPath('substrate_type')}
          options={codes?.WaterbodySubstrateCode}
          required
          rules={{ required: true, validate: (val) => minArrayLength(val, 1) }}
          tooltip={tooltips.plant.waterbody.substrate_type}
          width={Width.Half}
        />
        <SingleSelect
          label={'Tidal Influence'}
          tooltip={tooltips.plant.waterbody.tidal_influence}
          options={YesNoUnknown}
          name={getPath('tidal_influence')}
          required
          rules={{ required: true }}
          width={Width.Half}
        />
        <MultiSelect
          label={'Adjacent Land Use'}
          tooltip={tooltips.plant.waterbody.adjancent_land_use}
          options={codes?.AdjacentLandUseCode}
          name={getPath('adjacent_land_use')}
          width={Width.Half}
        />
        <MultiSelect
          tooltip={tooltips.plant.waterbody.inflow}
          label={'Inflow (Permanent)'}
          name={getPath('inflow_permanent')}
          options={codes?.WaterbodyFlowCode}
          width={Width.Half}
        />
        <MultiSelect
          label={'Inflow (Temp. or Seasonal)'}
          tooltip={tooltips.plant.waterbody.inflow}
          name={getPath('inflow_seasonal')}
          options={codes?.WaterbodyFlowSeasonalCode}
          width={Width.Half}
        />
        <MultiSelect
          label={'Outflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          name={getPath('outflow_permanent')}
          tooltip={tooltips.plant.waterbody.outflow}
          width={Width.Half}
        />
        <MultiSelect
          label={'Outflow (Seasonal)'}
          options={codes?.WaterbodyFlowCode}
          name={getPath('outflow_seasonal')}
          tooltip={tooltips.plant.waterbody.outflow}
          width={Width.Half}
        />
        <TextArea
          error={get(errors, getPath('comment'))}
          label={'Comment'}
          width={Width.Half}
          {...register(getPath('comment'))}
        />
      </Fieldset>

      {/* Shoreline Types Start */}
      <ArrayField<AquaticPlantObservationSchema, 'subtype_data.shoreline_types'>
        name="subtype_data.shoreline_types"
        label={'Shoreline Types'}
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1),
            totalPercent: (val) => checkSum(val, 100, { key: 'percent_covered', readable: 'percent covered' }),
            noRepeatType: (val) => noRepeatKey(val, 'shoreline_type', 'Shoreline Type')
          }
        }}
        emptyValue={
          (getDefaultFormState(ActivitySubtypes.Observation_Plant_Aquatic) as AquaticPlantObservationSchema)
            .subtype_data.shoreline_types[0]
        }
        renderRow={(index) => (
          <>
            <SingleSelect
              label={'Shoreline Type'}
              name={getPath(`shoreline_types.${index}.shoreline_type`)}
              options={codes?.ShorelineTypeCode}
              required
              rules={{ required: true }}
              tooltip={tooltips.plant.waterbody.shoreline_type}
              width={Width.Half}
            />
            <NumberInput
              error={get(errors, getPath(`shoreline_types.${index}.percent_covered`))}
              label={'Percent Covered (%)'}
              tooltip={tooltips.plant.waterbody.shoreline_percent}
              width={Width.Half}
              {...register(getPath(`shoreline_types.${index}.percent_covered`), { valueAsNumber: true })}
            />
          </>
        )}
      />

      {/* Water Quality Start */}
      <Fieldset label={'Water Quality'}>
        <NumberInput
          error={get(errors, getPath('max_depth_m'))}
          label="Maximum Depth (m)"
          tooltip={tooltips.plant.waterbody.depth}
          width={Width.Half}
          {...register(getPath('max_depth_m'), { valueAsNumber: true })}
        />
        <NumberInput
          error={get(errors, getPath('secchi_depth'))}
          label="Secchi Depth (m)"
          tooltip={tooltips.plant.waterbody.secchi_depth}
          width={Width.Half}
          {...register(getPath('secchi_depth'), { valueAsNumber: true })}
        />
        <TextInput
          error={get(errors, getPath('colour'))}
          label="Water Colour"
          width={Width.Half}
          {...register(getPath('colour'))}
        />
      </Fieldset>
      <Fieldset label={'Observation Information'}>
        <SingleSelect
          label="Suitable For Biocontrol Agent(s)"
          options={YesNoUnknown}
          tooltip={tooltips.plant.suitable_for_biocontrol_agent}
          name={getPath('suitable_for_biocontrol')}
          width={Width.Half}
          required
          rules={{ required: true }}
        />
        <SingleSelect
          label="Pre-treatment Observation"
          options={YesNoUnknown}
          tooltip={tooltips.basic.pretreatment_observation}
          name={getPath('pretreatment_observation')}
          width={Width.Half}
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
        emptyValue={
          (getDefaultFormState(ActivitySubtypes.Observation_Plant_Aquatic) as AquaticPlantObservationSchema)
            .subtype_data.entries[0]
        }
        renderRow={(index) => <AquaticPlantEntry index={index} />}
      />
    </>
  );
};

export default ObservationPlantAquatic;
