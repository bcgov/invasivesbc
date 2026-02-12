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
import CheckboxUI from '../uncontrolled/CheckboxUI/CheckboxUI';

const ObservationPlantAquatic = () => {
  const [voucherCollected, setVoucherCollected] = [true, true]; //useState<boolean>(!!voucherSpecimen);
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
          tooltip={'Select best description of waterbody type'}
          required
          name={'subtype_data.type'}
          rules={{ required: true }}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Name (Gazetted)'}
          tooltip={'Legal gazetted name of waterbody'}
          error={errors?.subtype_data?.name_gazetted}
          {...register('subtype_data.name_gazetted')}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Name (Local)'}
          tooltip={'Locally referred to name of waterbody'}
          error={errors?.subtype_data?.name_local}
          {...register('subtype_data.name_local')}
          width={Width.Half}
        />
        <TextInput
          label={'Waterbody Access'}
          tooltip={'Waterbody access options, public access options preferred.'}
          error={errors?.subtype_data?.access}
          {...register('subtype_data.access')}
          width={Width.Half}
        />
        <MultiSelect
          label={'Waterbody Use'}
          tooltip={'Choose all observed uses of waterbody that apply. If other is chosen, add details in the comments.'}
          options={codes?.WaterbodyUseCode}
          name={'subtype_data.water_use'}
          required
          rules={{ required: true, validate: (val) => minArrayLength(val, 1) }}
          width={Width.Half}
        />
        <MultiSelect
          label={'Water Level Management'}
          tooltip={
            'Select existing infrastructure, if any, that could allow water level management. If other, specify in comment field'
          }
          options={WaterLevelManagement}
          required
          rules={{ required: true, validate: (val) => minArrayLength(val, 1) }}
          name={'subtype_data.waterlevel_management'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Substrate Type'}
          options={codes?.SubstrateCode}
          tooltip={'Select the most prevalent substrate composition'}
          name={'subtype_data.substrate_type'}
          required
          rules={{ required: true, validate: (val) => minArrayLength(val, 1) }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Tidal Influence'}
          tooltip={'Indicate if the water level at the observation point is influenced by tides'}
          options={YesNoUnknown}
          name={'subtype_data.tidal_influence'}
          required
          rules={{ required: true }}
          width={Width.Half}
        />
        <MultiSelect
          label={'Adjacent Land Use'}
          tooltip={'Select all adjacent land uses that apply and add details in the comment box.'}
          options={codes?.AdjacentLandUseCode}
          name={'subtype_data.adjacent_land_use'}
          width={Width.Half}
        />
        <MultiSelect
          tooltip={
            'Select one or more inflow types (aka upstream source) and indicate details or name of source water in the comments if known.'
          }
          label={'Inflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          name={'subtype_data.inflow_permanent'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Inflow (Temp. or Seasonal)'}
          tooltip={
            'Select one or more temporary inflow types and indicate details or name of source water in the comments if known.'
          }
          options={codes?.WaterbodyFlowSeasonalCode}
          name={'subtype_data.inflow_seasonal'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Outflow (Permanent)'}
          options={codes?.WaterbodyFlowCode}
          tooltip={
            'Select one or more outflow types (downstream) and indicate details or name of outflow water in the comments if known.'
          }
          name={'subtype_data.outflow_permanent'}
          width={Width.Half}
        />
        <MultiSelect
          label={'Outflow (Seasonal)'}
          options={codes?.WaterbodyFlowCode}
          tooltip={
            'Select one or more outflow types (downstream) and indicate details or name of outflow water in the comments if known.'
          }
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
              tooltip={
                'Describe shoreline composition adjacent to observation (e.g. rip rap, road/parking lot, overhanging natural riparian veg, turf, fence, etc)'
              }
              options={codes?.ShorelineTypeCode}
              name={`subtype_data.shoreline_types.${index}.shoreline_type`}
              required
              rules={{ required: true }}
              width={Width.Half}
            />
            <NumberInput
              tooltip={'Percent covered by this shoreline type'}
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
          tooltip={'Enter the water depth in metres'}
          error={errors?.subtype_data?.max_depth_m}
          {...register('subtype_data.max_depth_m')}
          width={Width.Half}
        />
        <NumberInput
          label="Secchi Depth (m)"
          tooltip={
            'Enter the secchi depth in metres. The secchi depth is the depth of water beyond which a high-contrast pattern on a submerged disk is no longer visible.'
          }
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
          tooltip="Choose Yes if the infestation is large, evenly infested and the site is secure from future disturbance."
          name={'subtype_data.suitable_for_biocontrol'}
          required
          rules={{ required: true }}
        />
      </Fieldset>

      {/* Aquatic Plant Entries Start */}
      <ArrayField<AquaticPlantObservationSchema, 'subtype_data.entries'>
        name="subtype_data.entries"
        label={'Aquatic Invasive Plant Information'}
        emptyValue={{}}
        renderRow={(index, remove) => (
          <>
            <TextInput
              label={'Sample Point ID'}
              tooltip={
                'For Presence Surveys. Number each sample point in the same waterbody (e.g. 001, 002, 003, etc). Do not use for Extent Surveys'
              }
              error={errors?.subtype_data?.entries?.[index]?.sample_point_id}
              {...register(`subtype_data.entries.${index}.sample_point_id`)}
              width={Width.Half}
            />
            <SingleSelect
              label={'Invasive Plant'}
              tooltip={
                'For Presence survey: select species observed at coordinates. For Extent Survey: select target species for survey'
              }
              options={codes?.AquaticPlantCode}
              name={`subtype_data.entries.${index}.invasive_plant`}
              required
              rules={{ required: true }}
              width={Width.Half}
            />
            <SingleSelect
              tooltip={
                'The observation describes the presence or absence of target invasive plants within a defined area'
              }
              label={'Observation Type'}
              options={ObservationType}
              required
              rules={{ required: true }}
              name={`subtype_data.entries.${index}.observation_type`}
              width={Width.Half}
            />
            <SingleSelect
              tooltip={'Average number of individual plants per square meter expressed as a density class code'}
              label={'Density (plants/m2)'}
              options={codes?.DensityCode}
              name={`subtype_data.entries.${index}.density`}
              width={Width.Half}
            />
            <SingleSelect
              label={'Distribution'}
              tooltip={
                'Description of the average arrangement of invasive plant clusters within the observation area expressed as a distribution code'
              }
              options={codes?.DistributionCode}
              name={`subtype_data.entries.${index}.distribution`}
              width={Width.Half}
            />
            <SingleSelect
              tooltip={'Average phenological stage of plant; rosette, flowering, etc'}
              label={'Life Stage'}
              options={codes?.PlantLifeStageCode}
              name={`subtype_data.entries.${index}.life_stage`}
              width={Width.Half}
            />
            <CheckboxUI
              state={voucherCollected}
              onChange={() => setVoucherCollected}
              disabled={disabled}
              label="Voucher Specimen Collected"
              tooltip="Ideal to collect entire plant structure for verification purposes."
              width={Width.Half}
            />
            {/* <SingleSelect label={'Voucher Specimen Collected'} options={YesNo}/> */}
            <DeleteControl disabled={disabled} onClick={() => remove(index)} />
          </>
        )}
      />
    </>
  );
};

export default ObservationPlantAquatic;
