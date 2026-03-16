import { useFormContext } from 'react-hook-form';
import { AquaticMechTreatment, EntryBasePath } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useSelector } from 'utils/use_selector';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import { ActivitySubtypes } from 'sharedAPI';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import {
  checkSum,
  maxValue,
  minArrayLength,
  minValue,
  noRepeatKey
} from 'UI/Features/Records/Activity/forms/common/validators';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { DisposedMaterialFormat } from 'UI/Features/Records/Activity/forms/enums';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';

const TreatmentMechPlantAquatic = () => {
  const ROOT = 'subtype_data';
  const {
    register,
    formState: { errors }
  } = useFormContext<AquaticMechTreatment>();
  const codes = useSelector((state) => state.ActivityPage.formCodes);

  return (
    <>
      <Fieldset label={'Authorization'}>
        <TextInput
          label={'Authorization Information'}
          tooltip={tooltips.plant.waterbody.authorization_info}
          {...register(`${ROOT}.authorization_info`)}
        />
      </Fieldset>

      {/* Start of Shoreline Types */}
      <ArrayField<AquaticMechTreatment, 'subtype_data.shoreline_types'>
        label={'Shoreline Types'}
        name="subtype_data.shoreline_types"
        emptyValue={
          (
            getDefaultFormState(ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic)
              .subtype_data as AquaticMechTreatment['subtype_data']
          ).shoreline_types[0]
        }
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1),
            totalPercent: (val) => checkSum(val, 100, 'percent_covered'),
            noRepeatTypes: (val) => noRepeatKey(val, 'shoreline_type', 'Shoreline Type')
          }
        }}
        renderRow={(index, remove) => (
          <>
            <SingleSelect
              label="Shoreline Type"
              options={codes.ShorelineTypeCode}
              tooltip={tooltips.plant.waterbody.shoreline_type}
              name={`${ROOT}.shoreline_types.${index}.shoreline_type`}
              rules={{ required: true }}
              required
              width={Width.Half}
            />
            <NumberInput
              label="Percent Covered"
              type="number"
              required
              width={Width.Half}
              tooltip={tooltips.plant.waterbody.shoreline_percent}
              error={errors.subtype_data?.shoreline_types?.[index]?.percent_covered}
              {...register(`${ROOT}.shoreline_types.${index}.percent_covered`, {
                required: true,
                valueAsNumber: true,
                validate: {
                  min: (val) => minValue(val, 1),
                  max: (val) => maxValue(val, 100)
                }
              })}
            />
            <DeleteControl onClick={() => remove(index)} />
          </>
        )}
      />
      {/* Start of Aquatic Entries  */}
      <ArrayField<AquaticMechTreatment, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label="Entries"
        emptyValue={getDefaultFormState(ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic).subtype_data.entries[0]}
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
                options={codes.AquaticPlantCode}
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
                  valueAsNumber: true,
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
              <Fieldset nested label={'Disposed Material'}>
                <SingleSelect
                  label={'Disposed Material Format'}
                  options={DisposedMaterialFormat}
                  tooltip={tooltips.plant.disposed_material_format}
                  name={`${basePath}.disposed_material_format`}
                  width={Width.Half}
                />
                <NumberInput
                  label={'Disposed Material Amount'}
                  {...register(`${basePath}.disposed_material_amount`, { valueAsNumber: true })}
                  error={errors?.subtype_data?.entries?.[index]?.disposed_material_amount}
                  width={Width.Half}
                />
              </Fieldset>
              <DeleteControl onClick={() => remove(index)} />
            </>
          );
        }}
      />
    </>
  );
};

export default TreatmentMechPlantAquatic;
