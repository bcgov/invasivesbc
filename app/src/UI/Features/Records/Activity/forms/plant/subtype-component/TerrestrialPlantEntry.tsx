import { useSelector } from 'utils/use_selector';
import { useFormContext, useWatch } from 'react-hook-form';
import { TerrestrialPlantObservationSchema } from '../interfaces/subtypeInterfaces';
import SingleSelect from '../../common/SingleSelect/SingleSelect';
import { Width } from '../../common/utils';
import { ObservationType } from '../../enums';
import Fieldset from '../../common/Fieldset/Fieldset';
import TextInput from '../../common/TextInput/TextInput';
import DateInput from '../../common/DateInput/DateInput';
import Spacer from 'UI/Reusable/Spacer/Spacer';
import NumberInput from '../../common/NumberInput/NumberInput';
import DeleteControl from '../../common/DeleteControl/DeleteControl';
import { useState } from 'react';
import CheckboxUI from '../../uncontrolled/CheckboxUI/CheckboxUI';

interface Props {
  root: string;
  index: number;
  remove: (index: number) => void;
}

type EntryBasePath = `subtype_data.entries.${number}`;

const TerrestrialPlantEntryRow = ({ root, index, remove }: Props) => {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<TerrestrialPlantObservationSchema>();
  const basePath = `${root}.entries.${index}` as EntryBasePath;
  const voucherSpecimen = useWatch({
    control,
    name: `${basePath}.voucher_specimen`
  });

  const [voucherCollected, setVoucherCollected] = useState<boolean>(!!voucherSpecimen);
  const codes = useSelector((state) => state.ActivityPage?.formCodes);

  return (
    <>
      <SingleSelect
        label="Invasive Plant"
        required
        tooltip="Target invasive plant species for this observation at this location."
        options={codes?.TerrestrialPlantCode}
        name={`${basePath}.invasive_plant`}
        width={Width.Half}
      />

      <SingleSelect
        label="Observation Type"
        required
        tooltip="Presence or absence of target invasive plants within a defined area."
        options={ObservationType}
        name={`${basePath}.observation_type`}
        width={Width.Half}
      />

      <SingleSelect
        label="Density (plants/m2)"
        tooltip="Average number of individual plants per square meter expressed as a density class code"
        options={codes?.DensityCode}
        name={`${basePath}.density`}
        width={Width.Half}
      />

      <SingleSelect
        label="Distribution"
        options={codes?.DistributionCode}
        tooltip="Description of the average arrangement of invasive plant clusters within the observation area expressed as a distribution code"
        name={`${basePath}.distribution`}
        width={Width.Half}
      />

      <SingleSelect
        label="Life Stage"
        options={codes?.PlantLifeStageCode}
        tooltip="Average phenological stage of plant; rosette, flowering, etc"
        name={`${basePath}.life_stage`}
        width={Width.Half}
      />

      <CheckboxUI
        state={voucherCollected}
        onChange={setVoucherCollected}
        label="Voucher Specimen Collected"
        tooltip="Ideal to collect entire plant structure for verification purposes."
        width={Width.Half}
      />

      {voucherCollected && (
        <Fieldset label="Voucher Collection Information">
          <TextInput
            label="Voucher Sample ID"
            tooltip="Unique identifier for each voucher collected."
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

      <DeleteControl onClick={() => remove(index)} />
    </>
  );
};

export default TerrestrialPlantEntryRow;
