import { ActivitySubtypes } from 'sharedAPI';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { TerrestrialMechTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { minArrayLength, noRepeatKey } from 'UI/Features/Records/Activity/forms/common/validators';
import { useSelector } from 'utils/use_selector';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { useFormContext } from 'react-hook-form';
import { DisposedMaterialFormat } from 'UI/Features/Records/Activity/forms/enums';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';

type EntryBasePath = `subtype_data.entries.${number}`;
const TreatmentMechPlantTerrestrial = () => {
  const ROOT = 'subtype_data';
  const {
    register,
    formState: { errors, disabled }
  } = useFormContext<TerrestrialMechTreatment>();
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  return (
    <>
      <ArrayField<TerrestrialMechTreatment, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label="Entries"
        emptyValue={
          getDefaultFormState(ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial).subtype_data.entries[0]
        }
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1),
            noRepeatPlants: (val) => noRepeatKey(val, 'invasive_plant', 'Invasive Plant')
          }
        }}
        renderRow={(index, remove) => {
          const basePath = `${ROOT}.entries.${index}` as EntryBasePath;
          return (
            <>
              <SingleSelect
                label={'Invasive Plant'}
                options={codes.TerrestrialPlantCode}
                tooltip={tooltips.plant.invasive_plant}
                rules={{ required: true }}
                required
                name={`${basePath}.invasive_plant`}
                width={Width.Half}
              />
              <NumberInput
                label={'Treated Area (m2)'}
                required
                {...register(`${basePath}.treated_area_msq`, {
                  required: true,
                  min: { value: 1, message: 'Area must be greater than or equal to 1m' }
                })}
                error={errors?.subtype_data?.entries?.[index]?.treated_area_msq}
                width={Width.Half}
              />
              <SingleSelect
                label={'Mechanical Method'}
                options={codes?.PlantMechanicalTreatmentMethodCode}
                rules={{ required: true }}
                required
                name={`${basePath}.mechanical_method`}
                width={Width.Half}
              />
              <SingleSelect
                label={'Disposal Method'}
                options={codes.DisposalMethodCode}
                rules={{ required: true }}
                required
                name={`${basePath}.disposal_method`}
                width={Width.Half}
              />
              <Fieldset label={'Disposed Material'}>
                <SingleSelect
                  label={'Disposed Material Format'}
                  options={DisposedMaterialFormat}
                  tooltip={tooltips.plant.disposed_material_format}
                  name={`${basePath}.disposed_material_format`}
                  width={Width.Half}
                />
                <NumberInput
                  label={'Disposed Material Amount'}
                  {...register(`${basePath}.disposed_material_amount`)}
                  error={errors?.subtype_data?.entries?.[index]?.treated_area_msq}
                  width={Width.Half}
                />
              </Fieldset>
              <DeleteControl disabled={disabled} onClick={() => remove(index)} />
            </>
          );
        }}
      />
    </>
  );
};
export default TreatmentMechPlantTerrestrial;
