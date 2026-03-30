import { useEffect, useMemo, useState } from 'react';
import { get, useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';
import { ChemTreatment } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { greaterThan } from 'UI/Features/Records/Activity/forms/common/validators';
import { CalculationType } from 'UI/Features/Records/Activity/forms/enums';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { HerbicideApplicationRates } from 'sharedAPI';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import useLocalStorage from 'UI/Features/Records/Activity/forms/plant/hooks/useLocalStorage';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

type PropTypes = {
  idx?: number;
  type: CalculationType;
};

/** @desc Component Herbicide Entries in a Chemical Treatment Form. */
const HerbicideEntry = ({ idx, type }: PropTypes) => {
  /** @desc Validates the Application Rate against the (if known) Max Product Application Rate for an herbicide */
  const verifyApplicationRate = (val: number) => {
    const maxRate = HerbicideApplicationRates?.[herbicideEntry.name];
    if (!maxRate || !val || val <= maxRate) return true;
    const full = herbicideCodes.find(({ code }) => code === herbicideEntry.name)?.full_name;
    return `Application rate of ${full} exceeds maximum application rate of ${maxRate}L/ha`;
  };

  enum HerbicideType {
    Granular = 'granular',
    Liquid = 'liquid'
  }

  const {
    control,
    register,
    setValue,
    trigger,
    formState: { isDirty, errors, disabled }
  } = useFormContext<ChemTreatment>();

  const { basePath, getPath } = useFieldPath<ChemTreatment>(`subtype_data.treatment_context.herbicide.${idx}`);
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  const herbicideEntry = useWatch({ control, name: basePath });
  const productApplicationRateConsent = useLocalStorage(`applicationRateConsent-${idx}`);
  const [userConfirmedApplicationRate, setUserConfirmedApplicationRate] = useState<boolean>(
    productApplicationRateConsent.getConfirmation()
  );

  // Set Herbicide Codes based on Type
  const herbicideCodes = useMemo(() => {
    if (herbicideEntry.type === HerbicideType.Granular) return codes?.GranularHerbicideCode;
    if (herbicideEntry.type === HerbicideType.Liquid) return codes?.LiquidHerbicideCode;
    return [];
  }, [herbicideEntry?.type, codes]);

  // Check if an Application Value exceeds the Allotted amount.
  const doesProductApplicationRateRequireConfirmation = useMemo(() => {
    if (disabled || !herbicideEntry.application_rate) return false;
    const maximumApplicationRate = HerbicideApplicationRates?.[herbicideEntry.name];
    const rateIsAboveLimit = Boolean(
      maximumApplicationRate && herbicideEntry.application_rate > maximumApplicationRate
    );
    return rateIsAboveLimit;
  }, [disabled, herbicideEntry?.application_rate, herbicideEntry.name]);

  // Clear Herbicide Codes if selection is no longer valid. (e.g. User changed from Solid -> Liquid)
  useEffect(() => {
    if (!isDirty) return;
    const currentSelectionNoLongerValid =
      herbicideEntry.name && !herbicideCodes.some(({ code }) => code === herbicideEntry.name);
    if (currentSelectionNoLongerValid) {
      setValue(getPath('name'), '', { shouldDirty: true });
    }
  }, [herbicideCodes]);

  // Remove any previous confirmation if user changes fields
  useEffect(() => {
    if (!isDirty) return;
    setUserConfirmedApplicationRate(false);
    productApplicationRateConsent.remove();
  }, [herbicideEntry.name, herbicideEntry.code, herbicideEntry.application_rate, idx]);

  // Refire Validation if user confirms/denies accuracy of field.
  useEffect(() => {
    if (!isDirty) return;
    trigger(getPath('application_rate'));
  }, [userConfirmedApplicationRate]);
  const units = herbicideEntry?.type === HerbicideType.Granular ? 'g' : 'L';

  return (
    <>
      <SingleSelect
        label={'Herbicide Type'}
        name={getPath('type')}
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
        name={getPath('name')}
        required
        tooltip={tooltips.plant.chemical.calculation_fields.herbicide}
        noOptionsMessage="Select Herbicide Type First"
        options={herbicideCodes}
        rules={{ required: true }}
      />
      {type === CalculationType.ApplicationRate && (
        <>
          <NumberInput
            label={`Product Application Rate (${units}/ha)`}
            tooltip={tooltips.plant.chemical.calculation_fields.application_rate}
            required
            error={get(errors, getPath('application_rate'))}
            {...register(getPath('application_rate'), {
              required: true,
              valueAsNumber: true,
              shouldUnregister: true,
              deps: [getPath('name')],
              validate: {
                minValue: (val) => greaterThan(val, 0),
                verifyApplicationRate: (val) => userConfirmedApplicationRate || verifyApplicationRate(val)
              }
            })}
          />
          {doesProductApplicationRateRequireConfirmation && (
            <CheckboxUI
              label={`I verify that this application rate was intentionally applied and accurately recorded.`}
              required
              state={userConfirmedApplicationRate}
              warningConfirmation
              onChange={() => {
                setUserConfirmedApplicationRate((prev) => {
                  prev ? productApplicationRateConsent.remove() : productApplicationRateConsent.confirm();
                  return !prev;
                });
              }}
            />
          )}
        </>
      )}
    </>
  );
};

export default HerbicideEntry;
