import { useSelector } from 'utils/use_selector';
import { get, useFormContext, useWatch } from 'react-hook-form';
import { AquaticPlantObservationSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useEffect, useState } from 'react';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { ObservationType } from 'UI/Features/Records/Activity/forms/enums';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import VoucherCollection from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/VoucherCollection';
import FormSpacer from 'UI/Features/Records/Activity/forms/common/FormSpacer/FormSpacer';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

interface Props {
  index: number;
}

const AquaticPlantEntry = ({ index }: Props) => {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors, disabled, isDirty }
  } = useFormContext<AquaticPlantObservationSchema>();
  const { getPath } = useFieldPath<AquaticPlantObservationSchema>(`subtype_data.entries.${index}`);
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
      <TextInput
        label={'Sample Point ID'}
        tooltip={tooltips.plant.sample_point_id}
        error={get(errors, getPath('sample_point_id'))}
        {...register(getPath('sample_point_id'))}
        width={Width.Half}
      />
      <SingleSelect
        label={'Invasive Plant'}
        tooltip={tooltips.plant.aquatic_plant}
        options={codes?.AquaticPlantCode}
        name={getPath('invasive_plant')}
        required
        rules={{ required: true }}
        width={Width.Half}
      />
      <SingleSelect
        tooltip={tooltips.plant.observation_type}
        label={'Observation Type'}
        options={ObservationType}
        required
        rules={{ required: true }}
        name={getPath('observation_type')}
        width={Width.Half}
      />
      {observationType !== 'Negative' && (
        <>
          <SingleSelect
            tooltip={tooltips.plant.density}
            label={'Density (plants/m2)'}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            options={codes?.DensityCode}
            name={getPath('density')}
            width={Width.Half}
          />
          <SingleSelect
            label={'Distribution'}
            tooltip={tooltips.plant.distribution}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            options={codes?.DistributionCode}
            name={getPath('distribution')}
            width={Width.Half}
          />
          <SingleSelect
            tooltip={tooltips.plant.life_stage}
            label={'Life Stage'}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            options={codes?.PlantLifeStageCode}
            name={getPath('life_stage')}
            width={Width.Half}
          />
          <CheckboxUI
            state={voucherCollected}
            onChange={() => setVoucherCollected((prev) => !prev)}
            disabled={disabled}
            label="Voucher Specimen Collected"
            tooltip={tooltips.plant.voucher_specimen_collected}
            width={Width.Half}
          />
        </>
      )}
      <FormSpacer width={Width.Half} />
      {voucherCollected && <VoucherCollection index={index} />}
    </>
  );
};

export default AquaticPlantEntry;
