import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { TreatmentPass, YesNo } from 'UI/Features/Records/Activity/forms/enums';
import MultiSelect from 'UI/Features/Records/Activity/forms/common/MultiSelect/MultiSelect';
import { minArrayLength } from 'UI/Features/Records/Activity/forms/common/validators';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';
import {
  EntryBasePath,
  MonitoringChemPlantSchema,
  MonitoringMechPlantSchema
} from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import EmptySpace from 'UI/Features/Records/Activity/forms/common/EmptySpace/EmptySpace';

type PropTypes = {
  remove: Function;
  index: number;
};
const MonitoringChemMechPlantEntry = ({ index, remove }: PropTypes) => {
  const BASE = `subtype_data.entries.${index}` as EntryBasePath;
  const validatePlantRow = (formValues) => {
    const entry = formValues.subtype_data.entries[index];
    if (!entry.invasive_plant && !entry.invasive_plant_aquatic) {
      return 'Either Aquatic or Terrestrial Plant must be chosen';
    } else if (entry.invasive_plant && entry.invasive_plant_aquatic) {
      return "Can't Specify both Aquatic and Terrestrial Plants.";
    }
    return true;
  };

  const {
    register,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<MonitoringChemPlantSchema | MonitoringMechPlantSchema>();

  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const wasEvidenceOfTreatment = watch(`${BASE}.evidence_of_treatment`) === 'Yes';
  const hasAquaticPlant = watch(`${BASE}.invasive_plant_aquatic`);
  const hasTerrestrialPlant = watch(`${BASE}.invasive_plant`);

  useEffect(() => {
    if (!wasEvidenceOfTreatment) {
      setValue(`${BASE}.treatment_efficacy_rating`, '');
    }
  }, [wasEvidenceOfTreatment]);

  return (
    <>
      <SingleSelect
        label={'Terrestrial Invasive Plant'}
        name={`subtype_data.entries.${index}.invasive_plant`}
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
        name={`subtype_data.entries.${index}.invasive_plant_aquatic`}
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
        name={`subtype_data.entries.${index}.evidence_of_treatment`}
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
          name={`subtype_data.entries.${index}.treatment_efficacy_rating`}
          tooltip={tooltips.plant.treatment_efficacy_rating}
          width={Width.Half}
        />
      ) : (
        <EmptySpace width={Width.Half} />
      )}
      <SingleSelect
        label={'Management Efficacy Rating'}
        name={`subtype_data.entries.${index}.management_efficacy_rating`}
        options={codes?.EfficacyManagementRatingCode}
        required
        rules={{ required: true }}
        tooltip={tooltips.plant.management_efficacy_rating}
        width={Width.Half}
      />
      <MultiSelect
        label={'Invasive Plants on Site'}
        name={`subtype_data.entries.${index}.invasive_plants_on_site`}
        options={codes?.InvasivePlantsOnSiteCode}
        required
        rules={{ validate: (arr) => minArrayLength(arr, 1) }}
        tooltip={tooltips.plant.invasive_plant_on_site}
        width={Width.Half}
      />
      <SingleSelect
        label={'Treatment Pass'}
        name={`subtype_data.entries.${index}.treatment_pass`}
        options={TreatmentPass}
        tooltip={tooltips.plant.treatment_pass}
        width={Width.Half}
      />
      <TextInput
        label={'Comment'}
        error={errors.subtype_data?.entries?.[index]?.comment}
        tooltip={tooltips.plant.monitoring_comment}
        width={Width.Half}
        {...register(`subtype_data.entries.${index}.comment`)}
      />
      <DeleteControl onClick={() => remove(index)} />
    </>
  );
};

export default MonitoringChemMechPlantEntry;
