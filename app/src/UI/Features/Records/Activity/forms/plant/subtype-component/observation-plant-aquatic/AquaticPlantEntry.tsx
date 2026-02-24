import { useSelector } from 'utils/use_selector';
import { useFormContext, useWatch } from 'react-hook-form';
import Spacer from 'UI/Reusable/Spacer/Spacer';
import { AquaticPlantObservationSchema, EntryBasePath } from '../../interfaces';
import { useEffect, useState } from 'react';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { ObservationType } from 'UI/Features/Records/Activity/forms/enums';
import CheckboxUI from 'UI/Features/Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';

interface Props {
  root: string;
  index: number;
  remove: (index: number) => void;
}

const AquaticPlantEntry = ({ root, index, remove }: Props) => {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors, disabled, isDirty }
  } = useFormContext<AquaticPlantObservationSchema>();
  const basePath = `${root}.entries.${index}` as EntryBasePath;
  const voucherSpecimen = useWatch({
    control,
    name: `${basePath}.voucher_specimen`
  });

  const [voucherCollected, setVoucherCollected] = useState<boolean>(!!voucherSpecimen);
  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const observationType = watch(`${basePath}.observation_type`);
  const requiredWhenPositiveObservation = observationType === 'Positive';

  useEffect(() => {
    if (!voucherCollected && isDirty) {
      setValue(`${basePath}.voucher_specimen`, undefined);
    }
  }, [voucherCollected]);

  return (
    <>
      <TextInput
        label={'Sample Point ID'}
        tooltip={
          'For Presence Surveys. Number each sample point in the same waterbody (e.g. 001, 002, 003, etc). Do not use for Extent Surveys'
        }
        error={errors?.subtype_data?.entries?.[index]?.sample_point_id}
        {...register(`subtype_data.entries.${index}.sample_point_id`)}
        width={Width.Half}
      />
      <SingleSelect
        label={'Invasive Plant'}
        tooltip={tooltips.plant.aquatic_plant}
        options={codes?.AquaticPlantCode}
        name={`subtype_data.entries.${index}.invasive_plant`}
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
        name={`subtype_data.entries.${index}.observation_type`}
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
            name={`subtype_data.entries.${index}.density`}
            width={Width.Half}
          />
          <SingleSelect
            label={'Distribution'}
            tooltip={tooltips.plant.distribution}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            options={codes?.DistributionCode}
            name={`subtype_data.entries.${index}.distribution`}
            width={Width.Half}
          />
          <SingleSelect
            tooltip={tooltips.plant.life_stage}
            label={'Life Stage'}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            options={codes?.PlantLifeStageCode}
            name={`subtype_data.entries.${index}.life_stage`}
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
      {voucherCollected && (
        <Fieldset label="Voucher Collection Information">
          <TextInput
            label="Voucher Sample ID"
            tooltip={tooltips.plant.voucher_sample_id}
            {...register(`${basePath}.voucher_specimen.voucher_sample_id`, { required: true })}
            width={Width.Half}
            error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.voucher_sample_id}
          />

          <TextInput
            label="Herbarium"
            {...register(`${basePath}.voucher_specimen.herbarium`, { required: true })}
            width={Width.Half}
            error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.herbarium}
          />

          <TextInput
            label="Accession Number"
            {...register(`${basePath}.voucher_specimen.accession_number`, { required: true })}
            width={Width.Half}
            error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.accession_number}
          />
          <Spacer x={200} y={10} />

          <DateInput
            label="Date Voucher Collected"
            {...register(`${basePath}.voucher_specimen.date_collected`, { required: true })}
            width={Width.Half}
            error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.date_collected}
          />

          <DateInput
            label="Date Voucher Verified"
            {...register(`${basePath}.voucher_specimen.date_verified`, { required: true })}
            width={Width.Half}
            error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.date_verified}
          />
          <Fieldset label={'Voucher Verification Completed By'}>
            <TextInput
              label="Completed By (Person)"
              {...register(`${basePath}.voucher_specimen.completed_by_person`, { required: true })}
              width={Width.Half}
              error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.completed_by_person}
            />
            <TextInput
              label="Completed By (Org)"
              {...register(`${basePath}.voucher_specimen.completed_by_org`, { required: true })}
              width={Width.Half}
              error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.completed_by_org}
            />
          </Fieldset>

          <Fieldset label={'Exact Coordinate of Voucher Collection Site'}>
            <NumberInput
              label="UTM Zone"
              {...register(`${basePath}.voucher_specimen.utm_zone`, { required: true, valueAsNumber: true })}
              width={Width.Third}
              error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.utm_zone}
            />

            <NumberInput
              label="UTM Easting"
              {...register(`${basePath}.voucher_specimen.utm_easting`, { required: true, valueAsNumber: true })}
              width={Width.Third}
              error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.utm_easting}
            />

            <NumberInput
              label="UTM Northing"
              {...register(`${basePath}.voucher_specimen.utm_northing`, { required: true, valueAsNumber: true })}
              width={Width.Third}
              error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.utm_northing}
            />
          </Fieldset>
        </Fieldset>
      )}
      <DeleteControl onClick={() => remove(index)} />
    </>
  );
};

export default AquaticPlantEntry;
