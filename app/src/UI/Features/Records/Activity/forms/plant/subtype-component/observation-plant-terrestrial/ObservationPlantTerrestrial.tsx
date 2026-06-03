import { useSelector } from 'utils/use_selector';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { YesNoUnknown } from 'UI/Features/Records/Activity/forms/enums';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { minArrayLength, noRepeatKey } from 'UI/Features/Records/Activity/forms/common/validators';
import TerrestrialPlantEntry from 'UI/Features/Records/Activity/forms/plant/subtype-component/observation-plant-terrestrial/TerrestrialPlantEntry';
import { TerrestrialPlantObservationSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { ActivitySubtypes } from 'sharedAPI';
import MultiSelect from 'UI/Features/Records/Activity/forms/common/MultiSelect/MultiSelect';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

const ObservationPlantTerrestrial = () => {
  const { getPath } = useFieldPath<TerrestrialPlantObservationSchema>('subtype_data.context');

  const validateSlopeAspect = (val, formValues) => {
    const aspect = val?.code ?? val;
    const slope = formValues.subtype_data?.slope_percent?.code ?? formValues.subtype_data?.slope_percent;
    if ([aspect, slope].includes('FL') && aspect !== slope)
      return 'If either Aspect or Slope is flat, both of them must be flat.';
    return true;
  };

  const codes = useSelector((state) => state.ActivityPage?.formCodes);

  return (
    <>
      <Fieldset label={'Observation Plant Terrestrial Information'}>
        <SingleSelect
          label={'Soil Texture'}
          tooltip={tooltips.plant.soil_texture}
          options={codes?.SoilTextureCode}
          width={Width.Half}
          name={getPath('soil_texture')}
        />
        <MultiSelect
          label={'Specific Use'}
          options={codes?.SpecificUseCode}
          name={getPath('specific_uses')}
          required
          valueKey="specific_use"
          tooltip={tooltips.plant.terrestrial_specific_use}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Slope (%)'}
          options={codes?.SlopePercentCode}
          name={getPath('slope_percent')}
          required
          rules={{
            deps: [getPath('aspect')],
            required: true,
            validate: (val, formValues) => validateSlopeAspect(val, formValues)
          }}
          tooltip={tooltips.plant.slope_percent}
          width={Width.Half}
        />
        <SingleSelect
          label={'Aspect'}
          options={codes?.AspectCode}
          name={getPath('aspect')}
          tooltip={tooltips.plant.aspect}
          required
          rules={{
            required: true,
            deps: [getPath('slope_percent')],
            validate: (val, formValues) => validateSlopeAspect(val, formValues)
          }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Research Observation'}
          options={YesNoUnknown}
          name={getPath('research_observation')}
          required
          tooltip={tooltips.plant.research_observation}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Visible Well Nearby'}
          options={YesNoUnknown}
          name={getPath('visible_well_nearby')}
          required
          tooltip={tooltips.plant.visible_well_nearby}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label={'Suitable For Biocontrol Agent'}
          options={YesNoUnknown}
          name={getPath('suitable_for_biocontrol_agent')}
          required
          tooltip={tooltips.plant.suitable_for_biocontrol_agent}
          rules={{ required: true }}
          width={Width.Half}
        />
        <SingleSelect
          label="Pre-treatment Observation"
          options={YesNoUnknown}
          tooltip={tooltips.basic.pretreatment_observation}
          name={'subtype_data.pretreatment_observation'}
          width={Width.Half}
          required
          rules={{ required: true }}
        />
      </Fieldset>
      <ArrayField<TerrestrialPlantObservationSchema, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label="Terrestrial Invasive Plants"
        // Use builder to get empty entry. Less optimal but keeps declarations in one spot.
        emptyValue={
          (getDefaultFormState(ActivitySubtypes.Observation_Plant_Aquatic) as TerrestrialPlantObservationSchema)
            .subtype_data.entries[0]
        }
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1),
            noRepeatPlants: (val) => noRepeatKey(val, 'invasive_plant', 'Invasive Plant')
          }
        }}
        renderRow={(index) => <TerrestrialPlantEntry index={index} />}
      />
    </>
  );
};

export default ObservationPlantTerrestrial;
