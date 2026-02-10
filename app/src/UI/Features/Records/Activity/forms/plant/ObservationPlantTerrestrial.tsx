import { useSelector } from 'utils/use_selector';
import { useFormContext } from 'react-hook-form';
import Fieldset from '../common/Fieldset/Fieldset';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import { ObservationType, YesNo, YesNoUnknown } from '../enums';
import ArrayField from '../common/ArrayField/ArrayField';
import { FormSchema, TerrestrialPlantObservationSchema } from './subtypeInterfaces';
import DeleteControl from '../common/DeleteControl/DeleteControl';
import { Width } from '../common/utils';

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
          tooltip="Relative amount of sand, silt, clay, organic matter, and bedrock throughout the observation area"
          options={codes?.SoilTextureCode}
          width={Width.Half}
          name={'subtype_data.soil_texture'}
        />
        <SingleSelect
          label={'Specific Use'}
          options={codes?.SpecificUseCode}
          name={'subtype_data.specific_use'}
          required
          tooltip="Notable land uses or attributes within the observation area"
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Slope (%)'}
          options={codes?.SlopePercentCode}
          name={'subtype_data.slope_percent'}
          required
          rules={{ required: true }}
          tooltip="Exact or general slope of the land expressed as a percentage"
          width={Width.Half}
        />
        <SingleSelect
          label={'Aspect'}
          options={codes?.AspectCode}
          name={'subtype_data.aspect'}
          tooltip="Average orientation that slope is facing within the observation area (ie; SE = southeast)"
          required
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Research Observation'}
          options={YesNoUnknown}
          name={'subtype_data.research_observation'}
          required
          tooltip="Is this observation part of a research project? Add details in project code or comments fields"
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Visible Well Nearby'}
          options={YesNoUnknown}
          name={'subtype_data.visible_well_nearby'}
          required
          tooltip="Is there a visible well nearby? Indicate the distance from the observation in the comments"
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Suitable For Biocontrol Agent'}
          options={YesNoUnknown}
          name={'subtype_data.suitable_for_biocontrol_agent'}
          required
          tooltip="Choose Yes if the infestation is large, evenly infested and the site is secure from future disturbance."
          rules={{ required: true }}
          width={Width.Half}
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
              required
              tooltip="Target invasive plant species for this observation at this location. Create a separate observation for any other species at this location"
              options={codes?.TerrestrialPlantCode}
              name={`subtype_data.entries.${index}.invasive_plant`}
              width={Width.Half}
            />
            <SingleSelect
              label={'Observation Type'}
              required
              tooltip="The observation describes the presence or absence of target invasive plants within a defined area"
              options={ObservationType}
              name={`subtype_data.entries.${index}.observation_type`}
              width={Width.Half}
            />
            <SingleSelect
              label={'Density (plants/m2)'}
              options={codes?.DensityCode}
              tooltip="Average number of individual plants per square meter expressed as a density class code"
              name={`subtype_data.entries.${index}.density`}
              width={Width.Half}
            />
            <SingleSelect
              label={'Distribution'}
              tooltip="Description of the average arrangement of invasive plant clusters within the observation area expressed as a distribution code"
              options={codes?.DistributionCode}
              name={`subtype_data.entries.${index}.distribution`}
              width={Width.Half}
            />
            <SingleSelect
              label={'Life Stage'}
              tooltip="Average phenological stage of plant; rosette, flowering, etc"
              options={codes?.PlantLifeStageCode}
              name={`subtype_data.entries.${index}.life_stage`}
              width={Width.Half}
            />
            {/* <SingleSelect/> */}
            <DeleteControl onClick={() => remove(index)} />
          </>
        )}
      />
    </>
  );
};

export default ObservationPlantTerrestrial;
