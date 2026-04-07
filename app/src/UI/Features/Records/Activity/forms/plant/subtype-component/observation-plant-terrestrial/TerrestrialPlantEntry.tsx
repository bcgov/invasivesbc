import { useSelector } from 'utils/use_selector';
import { useFormContext, useWatch } from 'react-hook-form';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { ObservationType } from 'UI/Features/Records/Activity/forms/enums';
import { useEffect, useState } from 'react';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import { TerrestrialPlantObservationSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import VoucherCollection from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/VoucherCollection';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

interface Props {
  index: number;
}

const TerrestrialPlantEntry = ({ index }: Props) => {
  const { getPath } = useFieldPath<TerrestrialPlantObservationSchema>(`subtype_data.entries.${index}`);
  const {
    control,
    setValue,
    watch,
    formState: { disabled, isDirty }
  } = useFormContext<TerrestrialPlantObservationSchema>();

  const voucherSpecimen = useWatch({
    control,
    name: getPath('voucher_specimen')
  });

  const [voucherCollected, setVoucherCollected] = useState<boolean>(!!voucherSpecimen);
  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const observationType = watch(getPath('observation_type'));
  const requiredWhenPositiveObservation = observationType === 'Positive';

  useEffect(() => {
    if (!voucherCollected && isDirty) {
      setValue(getPath('voucher_specimen'), undefined);
    }
  }, [voucherCollected]);

  useEffect(() => {
    if (observationType === 'Negative' && isDirty) {
      setVoucherCollected(false);
      setValue(getPath('voucher_specimen'), undefined);
      setValue(getPath('density'), '');
      setValue(getPath('distribution'), '');
      setValue(getPath('life_stage'), '');
    }
  }, [observationType]);
  return (
    <>
      <SingleSelect
        label="Invasive Plant"
        required
        tooltip={tooltips.plant.invasive_plant}
        options={codes?.TerrestrialPlantCode}
        rules={{ required: true }}
        name={getPath('invasive_plant')}
        width={Width.Half}
      />

      <SingleSelect
        label="Observation Type"
        required
        tooltip={tooltips.plant.observation_type}
        options={ObservationType}
        rules={{ required: true }}
        name={getPath('observation_type')}
        width={Width.Half}
      />
      {observationType !== 'Negative' && (
        <>
          <SingleSelect
            label="Density (plants/m2)"
            tooltip={tooltips.plant.density}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            options={codes?.DensityCode}
            name={getPath('density')}
            width={Width.Half}
          />

          <SingleSelect
            label="Distribution"
            options={codes?.DistributionCode}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            tooltip={tooltips.plant.distribution}
            name={getPath('distribution')}
            width={Width.Half}
          />

          <SingleSelect
            label="Life Stage"
            options={codes?.PlantLifeStageCode}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            tooltip={tooltips.plant.life_stage}
            name={getPath('life_stage')}
            width={Width.Half}
          />

          <CheckboxUI
            state={voucherCollected}
            onChange={setVoucherCollected}
            disabled={disabled}
            label="Voucher Specimen Collected"
            tooltip={tooltips.plant.voucher_specimen_collected}
            width={Width.Half}
          />
        </>
      )}
      {voucherCollected && <VoucherCollection index={index} />}
    </>
  );
};

export default TerrestrialPlantEntry;
