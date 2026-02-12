import { useSelector } from 'utils/use_selector';
import Fieldset from '../common/Fieldset/Fieldset';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import { YesNoUnknown } from '../enums';
import ArrayField from '../common/ArrayField/ArrayField';
import { Width } from '../common/utils';
import { minArrayLength, noRepeatKey } from '../common/validators';
import TerrestrialPlantEntry from './subtype-component/TerrestrialPlantEntry';
import { TerrestrialPlantObservationSchema } from './interfaces';
import tooltips from './content/tooltips';
import getDefaultFormState from './builders/getDefaultState';
import { ActivitySubtypes } from 'sharedAPI';

const ObservationPlantTerrestrial = () => {
  const ROOT = 'subtype_data';
  const codes = useSelector((state) => state.ActivityPage?.formCodes);

  return (
    <>
      {/* Observation Persons Goes Here */}
      <Fieldset label={'Observation Plant Terrestrial Information'}>
        <SingleSelect
          label={'Soil Texture'}
          tooltip={tooltips.plant.soil_texture}
          options={codes?.SoilTextureCode}
          width={Width.Half}
          name={`${ROOT}.soil_texture`}
        />
        <SingleSelect
          label={'Specific Use'}
          options={codes?.SpecificUseCode}
          name={`${ROOT}.specific_use`}
          required
          tooltip={tooltips.plant.terrestrial_specific_use}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Slope (%)'}
          options={codes?.SlopePercentCode}
          name={`${ROOT}.slope_percent`}
          required
          rules={{
            deps: [`${ROOT}.aspect`],
            required: true,
            validate: (val, formValues) => {
              const slope = val?.code ?? val;
              const aspect = formValues.subtype_data?.aspect?.code ?? formValues.subtype_data?.aspect;
              if ([aspect, slope].includes('FL') && aspect !== slope)
                return 'If either Aspect or Slope is flat, both of them must be flat.';
              return true;
            }
          }}
          tooltip={tooltips.plant.slope_percent}
          width={Width.Half}
        />
        <SingleSelect
          label={'Aspect'}
          options={codes?.AspectCode}
          name={`${ROOT}.aspect`}
          tooltip={tooltips.plant.aspect}
          required
          rules={{
            required: true,
            deps: [`${ROOT}.slope_percent`],
            validate: (val, formValues) => {
              const aspect = val?.code ?? val;
              const slope = formValues.subtype_data?.slope_percent?.code ?? formValues.subtype_data?.slope_percent;
              if ([aspect, slope].includes('FL') && aspect !== slope)
                return 'If either Aspect or Slope is flat, both of them must be flat.';
              return true;
            }
          }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Research Observation'}
          options={YesNoUnknown}
          name={`${ROOT}.research_observation`}
          required
          tooltip={tooltips.plant.research_observation}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Visible Well Nearby'}
          options={YesNoUnknown}
          name={`${ROOT}.visible_well_nearby`}
          required
          tooltip={tooltips.plant.visible_well_nearby}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Suitable For Biocontrol Agent'}
          options={YesNoUnknown}
          name={`${ROOT}.suitable_for_biocontrol_agent`}
          required
          tooltip={tooltips.plant.suitable_for_biocontrol_agent}
          rules={{ required: true }}
          width={Width.Half}
        />
      </Fieldset>
      <ArrayField<TerrestrialPlantObservationSchema, 'subtype_data.entries'>
        name={`subtype_data.entries`}
        label="Terrestrial Invasive Plants"
        // Use builder to get empty entry. Less optimal but keeps declarations in one spot.
        emptyValue={getDefaultFormState(ActivitySubtypes.Observation_Plant_Aquatic).subtype_data.entries[0]}
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1),
            noRepeatPlants: (val) => noRepeatKey(val, 'invasive_plant', 'Invasive Plant')
          }
        }}
        renderRow={(index, remove) => <TerrestrialPlantEntry root={ROOT} index={index} remove={remove} />}
      />
    </>
  );
};

export default ObservationPlantTerrestrial;
