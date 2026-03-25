import { useEffect, useMemo } from 'react';
import { FieldPath, get, useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';
import { AquaticChemicalTreatmentSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { greaterThan } from 'UI/Features/Records/Activity/forms/common/validators';
import { CalculationType } from 'UI/Features/Records/Activity/forms/enums';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';

type PropTypes = {
  idx?: number;
  type: CalculationType;
};

/**
 * @desc Component Herbicide Entries in a Chemical Treatment Form.
 */
const HerbicideEntry = ({ idx, type }: PropTypes) => {
  enum HerbicideType {
    Granular = 'granular',
    Liquid = 'liquid'
  }

  const {
    control,
    unregister,
    register,
    setValue,
    formState: { isDirty, errors }
  } = useFormContext<AquaticChemicalTreatmentSchema>();

  const herbicideEntry = useWatch({
    control,
    name: `subtype_data.treatment_context.herbicide.${idx}` as FieldPath<AquaticChemicalTreatmentSchema>
  });

  const codes = useSelector((state) => state.ActivityPage.formCodes);

  // Set Available Herbicide Codes based on Type
  const herbicideCodes = useMemo(() => {
    if (herbicideEntry.type === HerbicideType.Granular) return codes?.GranularHerbicideCode;
    if (herbicideEntry.type === HerbicideType.Liquid) return codes?.LiquidHerbicideCode;
    return [];
  }, [herbicideEntry?.type, codes]);

  // Clear Herbicide Codes if selection is no longer valid. (e.g. User changed from Solid -> Liquid)
  useEffect(() => {
    if (!isDirty) return;
    const currentSelectionNoLongerValid =
      herbicideEntry.name && !herbicideCodes.some(({ code }) => code === herbicideEntry.name);
    if (currentSelectionNoLongerValid) {
      setValue(
        `subtype_data.treatment_context.herbicide.${idx}.name` as FieldPath<AquaticChemicalTreatmentSchema>,
        '',
        { shouldDirty: true }
      );
    }
  }, [herbicideCodes]);

  // Remove Application Rate from Form Payload if Calculation Type changes to Dilution. (No longer applicable)
  useEffect(() => {
    if (!isDirty) return;
    if (type === CalculationType.Dilution)
      unregister(
        `subtype_data.treatment_context.herbicide.${idx}.application_rate` as FieldPath<AquaticChemicalTreatmentSchema>
      );
  }, [type]);

  return (
    <>
      <SingleSelect
        label={'Herbicide Type'}
        name={`subtype_data.treatment_context.herbicide.${idx}.type`}
        required
        tooltip={tooltips.plant.chemical.calculation_fields.herbicide_type}
        options={[
          { code: HerbicideType.Granular, full_name: HerbicideType.Granular, table: 'HerbicideType' },
          { code: HerbicideType.Liquid, full_name: HerbicideType.Liquid, table: 'HerbicideType' }
        ]}
        rules={{ required: true }}
      />
      <SingleSelect
        label={'Herbicide'}
        name={`subtype_data.treatment_context.herbicide.${idx}.name`}
        tooltip={tooltips.plant.chemical.calculation_fields.herbicide}
        noOptionsMessage="Select Herbicide Type First"
        options={herbicideCodes}
        rules={{ required: true }}
      />
      {type === CalculationType.ApplicationRate && (
        <NumberInput
          label={'Product Application Rate'}
          tooltip={tooltips.plant.chemical.calculation_fields.application_rate}
          required
          error={get(errors, `subtype_data.treatment_context.herbicide.${idx}.application_rate`)}
          {...register(
            `subtype_data.treatment_context.herbicide.${idx}.application_rate` as FieldPath<AquaticChemicalTreatmentSchema>,
            { required: true, valueAsNumber: true, validate: (val) => greaterThan(val, 0) }
          )}
        />
      )}
    </>
  );
};

export default HerbicideEntry;
