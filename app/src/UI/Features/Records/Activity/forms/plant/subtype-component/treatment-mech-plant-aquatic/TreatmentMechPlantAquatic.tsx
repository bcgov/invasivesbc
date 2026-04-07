import { get, useFormContext } from 'react-hook-form';
import { AquaticMechTreatment, EntryBasePath } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useSelector } from 'utils/use_selector';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import { ActivitySubtypes } from 'sharedAPI';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import {
  checkSum,
  lessThanEqual,
  minArrayLength,
  noRepeatKey,
  greaterThan
} from 'UI/Features/Records/Activity/forms/common/validators';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { DisposedMaterialFormat } from 'UI/Features/Records/Activity/forms/enums';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

const TreatmentMechPlantAquatic = () => {
  const {
    register,
    formState: { errors }
  } = useFormContext<AquaticMechTreatment>();
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const { getPath } = useFieldPath<AquaticMechTreatment>('subtype_data');
  return (
    <>
      <Fieldset label={'Authorization'}>
        <TextInput
          label={'Authorization Information'}
          tooltip={tooltips.plant.waterbody.authorization_info}
          {...register(getPath('authorization_info'))}
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
            totalPercent: (val) => checkSum(val, 100, { key: 'percent_covered', readable: 'percent covered' }),
            noRepeatTypes: (val) => noRepeatKey(val, 'shoreline_type', 'Shoreline Type')
          }
        }}
        renderRow={(index) => (
          <>
            <SingleSelect
              label="Shoreline Type"
              options={codes.ShorelineTypeCode}
              tooltip={tooltips.plant.waterbody.shoreline_type}
              name={getPath(`shoreline_types.${index}.shoreline_type`)}
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
              {...register(getPath(`shoreline_types.${index}.percent_covered`), {
                required: true,
                valueAsNumber: true,
                validate: {
                  min: (val) => greaterThan(val, 0),
                  max: (val) => lessThanEqual(val, 100)
                }
              })}
            />
          </>
        )}
      />
      {/* Start of Aquatic Entries  */}
      <ArrayField<AquaticMechTreatment, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label="Entries"
        emptyValue={
          (getDefaultFormState(ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic) as AquaticMechTreatment)
            .subtype_data.entries[0]
        }
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1),
            noRepeatPlants: (val) => noRepeatKey(val, 'invasive_plant', 'Invasive Plant')
          }
        }}
        renderRow={(index) => {
          const basePath = getPath(`entries.${index}`) as EntryBasePath;
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
                  error={get(errors, `${basePath}.disposed_material_amount`)}
                  width={Width.Half}
                  {...register(`${basePath}.disposed_material_amount`, { valueAsNumber: true })}
                />
              </Fieldset>
            </>
          );
        }}
      />
    </>
  );
};

export default TreatmentMechPlantAquatic;
