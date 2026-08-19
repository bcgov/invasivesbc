import { ActivitySubtypes } from 'sharedAPI';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { EntryBasePath, TerrestrialMechTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { distinctEntries, minArrayLength } from 'UI/Features/Records/Activity/forms/common/validators';
import { useSelector } from 'utils/use_selector';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { get, useFormContext } from 'react-hook-form';
import { DisposedMaterialFormat } from 'UI/Features/Records/Activity/forms/enums';

const TreatmentMechPlantTerrestrial = () => {
  const ROOT = 'subtype_data';
  const {
    register,
    formState: { errors }
  } = useFormContext<TerrestrialMechTreatment>();
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  return (
    <ArrayField<TerrestrialMechTreatment, 'subtype_data.entries'>
      name={'subtype_data.entries'}
      label="Entries"
      emptyValue={
        (getDefaultFormState(ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial) as TerrestrialMechTreatment)
          .subtype_data.entries[0]
      }
      rules={{
        validate: {
          minLength: (val) => minArrayLength(val, 1),
          noRepeatMethodsOnPlants: (val) =>
            distinctEntries(
              val,
              ['invasive_plant', 'mechanical_method'],
              'Entries must contain a unique Invasive Plant / Mechanical Method combination'
            )
        }
      }}
      renderRow={(index) => {
        const basePath = `${ROOT}.entries.${index}` as EntryBasePath;
        return (
          <>
            <SingleSelect
              label={'Invasive Plant'}
              name={`${basePath}.invasive_plant`}
              options={codes.TerrestrialPlantCode}
              rules={{ required: true }}
              required
              tooltip={tooltips.plant.invasive_plant}
              width={Width.Half}
            />
            <NumberInput
              error={get(errors, `${basePath}.treated_area_msq`)}
              label={'Treated Area (m2)'}
              required
              width={Width.Half}
              {...register(`${basePath}.treated_area_msq`, {
                required: true,
                valueAsNumber: true,
                min: { value: 1, message: 'Area must be greater than or equal to 1m' }
              })}
            />
            <SingleSelect
              label={'Mechanical Method'}
              name={`${basePath}.mechanical_method`}
              options={codes?.PlantMechanicalTreatmentMethodCode}
              rules={{ required: true }}
              required
              width={Width.Half}
            />
            <SingleSelect
              label={'Disposal Method'}
              name={`${basePath}.disposal_method`}
              options={codes.DisposalMethodCode}
              required
              rules={{ required: true }}
              width={Width.Half}
            />
            <Fieldset label={'Disposed Material'}>
              <SingleSelect
                label={'Disposed Material Format'}
                name={`${basePath}.disposed_material_format`}
                options={DisposedMaterialFormat}
                tooltip={tooltips.plant.disposed_material_format}
                width={Width.Half}
              />
              <NumberInput
                error={get(errors, `${basePath}.disposed_material_amount`)}
                label={'Disposed Material Amount'}
                width={Width.Half}
                {...register(`${basePath}.disposed_material_amount`, { valueAsNumber: true })}
              />
            </Fieldset>
          </>
        );
      }}
    />
  );
};
export default TreatmentMechPlantTerrestrial;
