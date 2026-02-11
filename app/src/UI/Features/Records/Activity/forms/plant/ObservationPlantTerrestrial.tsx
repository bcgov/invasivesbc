import { useSelector } from 'utils/use_selector';
import Fieldset from '../common/Fieldset/Fieldset';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import { YesNoUnknown } from '../enums';
import ArrayField from '../common/ArrayField/ArrayField';
import { TerrestrialPlantObservationSchema } from './subtypeInterfaces';
import { Width } from '../common/utils';
import { minArrayLength, noRepeatKey } from '../common/validators';
import TerrestrialPlantEntryRow from './subtype-component/TerrestrialPlantEntry';

const ObservationPlantTerrestrial = () => {
  const ROOT = 'subtype_data';
  const codes = useSelector((state) => state.ActivityPage?.formCodes);

  return (
    <>
      {/* Observation Persons Goes Here */}
      <Fieldset label={'Observation Plant Terrestrial Information'}>
        <SingleSelect
          label={'Soil Texture'}
          tooltip="Relative amount of sand, silt, clay, organic matter, and bedrock throughout the observation area"
          options={codes?.SoilTextureCode}
          width={Width.Half}
          name={`${ROOT}.soil_texture`}
        />
        <SingleSelect
          label={'Specific Use'}
          options={codes?.SpecificUseCode}
          name={`${ROOT}.specific_use`}
          required
          tooltip="Notable land uses or attributes within the observation area"
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Slope (%)'}
          options={codes?.SlopePercentCode}
          name={`${ROOT}.slope_percent`}
          required
          rules={{ required: true }}
          tooltip="Exact or general slope of the land expressed as a percentage"
          width={Width.Half}
        />
        <SingleSelect
          label={'Aspect'}
          options={codes?.AspectCode}
          name={`${ROOT}.aspect`}
          tooltip="Average orientation that slope is facing within the observation area (ie; SE = southeast)"
          required
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Research Observation'}
          options={YesNoUnknown}
          name={`${ROOT}.research_observation`}
          required
          tooltip="Is this observation part of a research project? Add details in project code or comments fields"
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Visible Well Nearby'}
          options={YesNoUnknown}
          name={`${ROOT}.visible_well_nearby`}
          required
          tooltip="Is there a visible well nearby? Indicate the distance from the observation in the comments"
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Suitable For Biocontrol Agent'}
          options={YesNoUnknown}
          name={`${ROOT}.suitable_for_biocontrol_agent`}
          required
          tooltip="Choose Yes if the infestation is large, evenly infested and the site is secure from future disturbance."
          rules={{ required: true }}
          width={Width.Half}
        />
      </Fieldset>
      <ArrayField<TerrestrialPlantObservationSchema, 'subtype_data.entries'>
        name={`subtype_data.entries`}
        label="Terrestrial Invasive Plants"
        emptyValue={{
          invasive_plant: '',
          observation_type: '',
          density: '',
          distribution: '',
          life_stage: ''
        }}
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1),
            noRepeatPlants: (val) => noRepeatKey(val, 'invasive_plant', 'Invasive Plant')
          }
        }}
        renderRow={(index, remove) => <TerrestrialPlantEntryRow root={ROOT} index={index} remove={remove} />}
      />
    </>
  );
};

export default ObservationPlantTerrestrial;
