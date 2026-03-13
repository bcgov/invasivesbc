import { useFormContext } from 'react-hook-form';
import {
  AquaticPlantObservationSchema,
  TerrestrialPlantObservationSchema
} from 'UI/Features/Records/Activity/forms/plant/interfaces';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import FormSpacer from 'UI/Features/Records/Activity/forms/common/FormSpacer/FormSpacer';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';

type Observation = TerrestrialPlantObservationSchema | AquaticPlantObservationSchema;

const VoucherCollection = ({ index }) => {
  const {
    register,
    formState: { errors }
  } = useFormContext<Observation>();
  return (
    <>
      <TextInput
        required
        label="Voucher Sample ID"
        tooltip={tooltips.plant.voucher_sample_id}
        {...register(`subtype_data.entries.${index}.voucher_specimen.voucher_sample_id`, { required: true })}
        width={Width.Half}
        error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.voucher_sample_id}
      />

      <TextInput
        required
        label="Herbarium"
        {...register(`subtype_data.entries.${index}.voucher_specimen.herbarium`, { required: true })}
        width={Width.Half}
        error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.herbarium}
      />

      <TextInput
        required
        label="Accession Number"
        {...register(`subtype_data.entries.${index}.voucher_specimen.accession_number`, { required: true })}
        width={Width.Half}
        error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.accession_number}
      />
      <FormSpacer width={Width.Half} />

      <DateInput
        required
        label="Date Voucher Collected"
        {...register(`subtype_data.entries.${index}.voucher_specimen.date_collected`, { required: true })}
        width={Width.Half}
        error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.date_collected}
      />

      <DateInput
        required
        label="Date Voucher Verified"
        {...register(`subtype_data.entries.${index}.voucher_specimen.date_verified`, { required: true })}
        width={Width.Half}
        error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.date_verified}
      />
      <Fieldset nested label={'Voucher Verification Completed By'}>
        <TextInput
          required
          label="Completed By (Person)"
          {...register(`subtype_data.entries.${index}.voucher_specimen.completed_by_person`, { required: true })}
          width={Width.Half}
          error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.completed_by_person}
        />
        <TextInput
          label="Completed By (Org)"
          required
          {...register(`subtype_data.entries.${index}.voucher_specimen.completed_by_org`, { required: true })}
          width={Width.Half}
          error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.completed_by_org}
        />
      </Fieldset>

      <Fieldset nested label={'Exact Coordinate of Voucher Collection Site'}>
        <NumberInput
          label="UTM Zone"
          required
          {...register(`subtype_data.entries.${index}.voucher_specimen.utm_zone`, {
            required: true,
            valueAsNumber: true
          })}
          width={Width.Third}
          error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.utm_zone}
        />

        <NumberInput
          label="UTM Easting"
          required
          {...register(`subtype_data.entries.${index}.voucher_specimen.utm_easting`, {
            required: true,
            valueAsNumber: true
          })}
          width={Width.Third}
          error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.utm_easting}
        />

        <NumberInput
          label="UTM Northing"
          required
          {...register(`subtype_data.entries.${index}.voucher_specimen.utm_northing`, {
            required: true,
            valueAsNumber: true
          })}
          width={Width.Third}
          error={errors?.subtype_data?.entries?.[index]?.voucher_specimen?.utm_northing}
        />
      </Fieldset>
    </>
  );
};

export default VoucherCollection;
