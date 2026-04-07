import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { TreatmentPass, YesNo } from 'UI/Features/Records/Activity/forms/enums';
import MultiSelect from 'UI/Features/Records/Activity/forms/common/MultiSelect/MultiSelect';
import { minArrayLength } from 'UI/Features/Records/Activity/forms/common/validators';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import {
  MonitoringChemPlantSchema,
  MonitoringMechPlantSchema
} from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { get, useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import FormSpacer from 'UI/Features/Records/Activity/forms/common/FormSpacer/FormSpacer';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

type PropTypes = {
  index: number;
};

const MonitoringChemMechPlantEntry = ({ index }: PropTypes) => {
  const validatePlantRow = (formValues) => {
    const entry = get(formValues, basePath);
    if (!entry.invasive_plant && !entry.invasive_plant_aquatic) {
      return 'Either Aquatic or Terrestrial Plant must be chosen';
    } else if (entry.invasive_plant && entry.invasive_plant_aquatic) {
      return "Can't Specify both Aquatic and Terrestrial Plants.";
    }
    return true;
  };

  const { basePath, getPath } = useFieldPath<MonitoringChemPlantSchema | MonitoringMechPlantSchema>(
    `subtype_data.entries.${index}`
  );
  const {
    register,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<MonitoringChemPlantSchema | MonitoringMechPlantSchema>();

  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const wasEvidenceOfTreatment = watch(getPath('evidence_of_treatment')) === 'Yes';
  const hasAquaticPlant = watch(getPath('invasive_plant_aquatic'));
  const hasTerrestrialPlant = watch(getPath('invasive_plant'));

  useEffect(() => {
    if (!wasEvidenceOfTreatment) {
      setValue(getPath('treatment_efficacy_rating'), '');
    }
  }, [wasEvidenceOfTreatment]);

  return (
    <>
      <SingleSelect
        label={'Terrestrial Invasive Plant'}
        name={getPath('invasive_plant')}
        required={!hasAquaticPlant}
        tooltip={tooltips.plant.invasive_plant}
        width={Width.Half}
        rules={{
          required: !hasAquaticPlant,
          validate: (_, formValues) => validatePlantRow(formValues)
        }}
        options={codes?.TerrestrialPlantCode}
      />
      <SingleSelect
        label={'Aquatic Invasive Plant'}
        name={getPath('invasive_plant_aquatic')}
        options={codes?.AquaticPlantCode}
        required={!hasTerrestrialPlant}
        tooltip={tooltips.plant.invasive_plant}
        width={Width.Half}
        rules={{
          required: !hasTerrestrialPlant,
          validate: (_, formValues) => validatePlantRow(formValues)
        }}
      />
      <SingleSelect
        label={'Evidence of Treatment'}
        name={getPath('evidence_of_treatment')}
        options={YesNo}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.invasive_plant}
        width={Width.Half}
      />
      {wasEvidenceOfTreatment ? (
        <SingleSelect
          label={'Treatment Efficacy Rating'}
          options={codes?.TreatmentEfficacyRatingCode}
          name={getPath('treatment_efficacy_rating')}
          tooltip={tooltips.plant.treatment_efficacy_rating}
          width={Width.Half}
        />
      ) : (
        <FormSpacer width={Width.Half} />
      )}
      <SingleSelect
        label={'Management Efficacy Rating'}
        name={getPath('management_efficacy_rating')}
        options={codes?.EfficacyManagementRatingCode}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.management_efficacy_rating}
        width={Width.Half}
      />
      <MultiSelect
        label={'Invasive Plants on Site'}
        name={getPath('invasive_plants_on_site')}
        options={codes?.InvasivePlantsOnSiteCode}
        required
        rules={{ validate: (arr) => minArrayLength(arr, 1) }}
        tooltip={tooltips.plant.invasive_plant_on_site}
        width={Width.Half}
      />
      <SingleSelect
        label={'Treatment Pass'}
        name={getPath('treatment_pass')}
        options={TreatmentPass}
        tooltip={tooltips.plant.treatment_pass}
        width={Width.Half}
      />
      <TextInput
        label={'Comment'}
        error={errors.subtype_data?.entries?.[index]?.comment}
        tooltip={tooltips.plant.monitoring_comment}
        width={Width.Half}
        {...register(getPath('comment'))}
      />
    </>
  );
};

export default MonitoringChemMechPlantEntry;
