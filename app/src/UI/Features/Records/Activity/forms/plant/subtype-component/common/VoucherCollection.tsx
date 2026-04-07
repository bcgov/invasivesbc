import { get, useFormContext } from 'react-hook-form';
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
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

type Observation = TerrestrialPlantObservationSchema | AquaticPlantObservationSchema;

const VoucherCollection = ({ index }) => {
  const { getPath } = useFieldPath<Observation>(`subtype_data.entries.${index}.voucher_specimen`);
  const {
    register,
    formState: { errors }
  } = useFormContext<Observation>();
  return (
    <Fieldset label={'Voucher Specimen Collection Information'}>
      <TextInput
        error={get(errors, getPath('voucher_sample_id'))}
        label="Voucher Sample ID"
        required
        tooltip={tooltips.plant.voucher_sample_id}
        width={Width.Half}
        {...register(getPath('voucher_sample_id'), { required: true })}
      />

      <TextInput
        error={get(errors, getPath('herbarium'))}
        label="Herbarium"
        required
        width={Width.Half}
        {...register(getPath('herbarium'), { required: true })}
      />

      <TextInput
        error={get(errors, getPath('accession_number'))}
        required
        label="Accession Number"
        width={Width.Half}
        {...register(getPath('accession_number'), { required: true })}
      />

      <FormSpacer width={Width.Half} />

      <DateInput
        error={get(errors, getPath('date_collected'))}
        label="Date Voucher Collected"
        required
        width={Width.Half}
        {...register(getPath('date_collected'), {
          required: true
        })}
      />

      <DateInput
        error={get(errors, getPath('date_verified'))}
        label="Date Voucher Verified"
        required
        width={Width.Half}
        {...register(getPath('date_verified'), { required: true })}
      />
      <Fieldset label={'Voucher Verification Completed By'}>
        <TextInput
          error={get(errors, getPath('completed_by_person'))}
          label="Completed By (Person)"
          required
          width={Width.Half}
          {...register(getPath('completed_by_person'), { required: true })}
        />
        <TextInput
          error={get(errors, getPath('completed_by_org'))}
          label="Completed By (Org)"
          required
          width={Width.Half}
          {...register(getPath('completed_by_org'), { required: true })}
        />
      </Fieldset>

      <Fieldset label={'Exact Coordinate of Voucher Collection Site'}>
        <NumberInput
          error={get(errors, getPath('utm_zone'))}
          label="UTM Zone"
          required
          width={Width.Third}
          {...register(getPath('utm_zone'), {
            required: true,
            valueAsNumber: true
          })}
        />

        <NumberInput
          error={get(errors, getPath('utm_easting'))}
          label="UTM Easting"
          required
          width={Width.Third}
          {...register(getPath('utm_easting'), {
            required: true,
            valueAsNumber: true
          })}
        />

        <NumberInput
          error={get(errors, getPath('utm_northing'))}
          label="UTM Northing"
          required
          width={Width.Third}
          {...register(getPath('utm_northing'), {
            required: true,
            valueAsNumber: true
          })}
        />
      </Fieldset>
    </Fieldset>
  );
};

export default VoucherCollection;
