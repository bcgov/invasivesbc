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
          options={codes?.SoilTextureCode}
          width={Width.Half}
          name={'subtype_data.soil_texture'}
        />
        <SingleSelect
          label={'Specific Use'}
          options={codes?.SpecificUseCode}
          name={'subtype_data.specific_use'}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Slope (%)'}
          options={codes?.SlopePercentCode}
          name={'subtype_data.slope_percent'}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Aspect'}
          options={codes?.AspectCode}
          name={'subtype_data.aspect'}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Research Observation'}
          options={YesNoUnknown}
          name={'subtype_data.research_observation'}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Visible Well Nearby'}
          options={YesNoUnknown}
          name={'subtype_data.visible_well_nearby'}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Suitable For Biocontrol Agent'}
          options={YesNoUnknown}
          name={'subtype_data.suitable_for_biocontrol_agent'}
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
              isSearchable
              options={codes?.TerrestrialPlantCode}
              name={`subtype_data.entries.${index}.invasive_plant`}
              rules={{ required: true }}
              width={Width.Half}
            />
            <SingleSelect
              label={'Observation Type'}
              options={ObservationType}
              name={`subtype_data.entries.${index}.observation_type`}
              rules={{ required: true }}
              width={Width.Half}
            />
            <SingleSelect
              label={'Density (plants/m2)'}
              options={codes?.DensityCode}
              name={`subtype_data.entries.${index}.density`}
              rules={{ required: true }}
              width={Width.Half}
            />
            <SingleSelect
              label={'Distribution'}
              options={codes?.DistributionCode}
              name={`subtype_data.entries.${index}.distribution`}
              rules={{ required: true }}
              width={Width.Half}
            />
            <SingleSelect
              label={'Life Stage'}
              options={codes?.PlantLifeStageCode}
              name={`subtype_data.entries.${index}.life_stage`}
              rules={{ required: true }}
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
