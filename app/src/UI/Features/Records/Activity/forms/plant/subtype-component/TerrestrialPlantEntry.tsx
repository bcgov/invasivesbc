import { useSelector } from 'utils/use_selector';
import { useFormContext, useWatch } from 'react-hook-form';
import SingleSelect from '../../common/SingleSelect/SingleSelect';
import { Width } from '../../common/utils';
import { ObservationType } from '../../enums';
import Fieldset from '../../common/Fieldset/Fieldset';
import TextInput from '../../common/TextInput/TextInput';
import DateInput from '../../common/DateInput/DateInput';
import Spacer from 'UI/Reusable/Spacer/Spacer';
import NumberInput from '../../common/NumberInput/NumberInput';
import DeleteControl from '../../common/DeleteControl/DeleteControl';
import { useEffect, useState } from 'react';
import CheckboxUI from '../../uncontrolled/CheckboxUI/CheckboxUI';
import { TerrestrialPlantObservationSchema } from '../interfaces';
import tooltips from '../content/tooltips';

interface Props {
  root: string;
  index: number;
  remove: (index: number) => void;
}

type EntryBasePath = `subtype_data.entries.${number}`;

const TerrestrialPlantEntry = ({ root, index, remove }: Props) => {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors, disabled, isDirty }
  } = useFormContext<TerrestrialPlantObservationSchema>();
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
      <SingleSelect
        label="Invasive Plant"
        required
        tooltip={tooltips.plant.invasive_plant}
        options={codes?.TerrestrialPlantCode}
        rules={{ required: true }}
        name={`${basePath}.invasive_plant`}
        width={Width.Half}
      />

      <SingleSelect
        label="Observation Type"
        required
        tooltip={tooltips.plant.observation_type}
        options={ObservationType}
        rules={{ required: true }}
        name={`${basePath}.observation_type`}
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
            name={`${basePath}.density`}
            width={Width.Half}
          />

          <SingleSelect
            label="Distribution"
            options={codes?.DistributionCode}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            tooltip={tooltips.plant.distribution}
            name={`${basePath}.distribution`}
            width={Width.Half}
          />

          <SingleSelect
            label="Life Stage"
            options={codes?.PlantLifeStageCode}
            rules={{ required: requiredWhenPositiveObservation }}
            required={requiredWhenPositiveObservation}
            tooltip={tooltips.plant.life_stage}
            name={`${basePath}.life_stage`}
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
              {...register(`${basePath}.voucher_specimen.utm_zone`, { required: true })}
              width={Width.Third}
              error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.utm_zone}
            />

            <NumberInput
              label="UTM Easting"
              {...register(`${basePath}.voucher_specimen.utm_easting`, { required: true })}
              width={Width.Third}
              error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.utm_easting}
            />

            <NumberInput
              label="UTM Northing"
              {...register(`${basePath}.voucher_specimen.utm_northing`, { required: true })}
              width={Width.Third}
              error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.utm_northing}
            />
          </Fieldset>
        </Fieldset>
      )}

      <DeleteControl disabled={disabled} onClick={() => remove(index)} />
    </>
  );
};

export default TerrestrialPlantEntry;
