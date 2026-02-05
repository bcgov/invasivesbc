import { useForm, SubmitHandler, useWatch, FormProvider } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';

import './activityForm.css';
import TextInput from '../common/TextInput/TextInput';
import SingleSelect from '../common/SingleSelect/SingleSelect';
import Fieldset from '../common/Fieldset/Fieldset';
import DateInput from '../common/DateInput/DateInput';
import NumberInput from '../common/NumberInput/NumberInput';
import TextArea from '../common/TextArea/TextArea';
import { checkSum, noFutureDate } from '../common/validators';
import { useEffect } from 'react';
import ArrayField from '../common/ArrayField/ArrayField';
import { Delete } from '@mui/icons-material';
import SubtypeComposite from './SubtypeComposite';
import { FormSchema } from './subtypeInterfaces';

const ActivityForm = () => {
  const methods = useForm<FormSchema>({
    defaultValues: {
      jurisdictions: [{ jurisdiction: '', percent_covered: 0 }],
      project_code: [{ description: '' }],
      funding_agency: [{ agency: '' }]
    },
    mode: 'onChange'
  });
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState,
    trigger,
    unregister,
    watch,
    formState: { errors, isDirty }
  } = methods;

  const onSubmit: SubmitHandler<FormSchema> = (data) => console.log(data);
  const codes = useSelector((state) => state.ActivityPage?.formCodes);
  const formData = watch();

  useEffect(() => {
    register('jurisdictions', { validate: (val) => checkSum(val, 100, 'percent_covered') });
  }, [register]);

  useEffect(() => {
    // After first update, enforce Validation
    if (!isDirty) return;
    trigger();
  }, [isDirty]);

  return (
    <div className="activity-page">
      <FormProvider {...methods}>
        <form autoComplete={'off'} className="activity-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Start Geometry Fields */}
          <Fieldset label={'Geometry Information'}>
            <p>To modify or update, please draw a new shape on the Map</p>
            <button onClick={() => alert('Not implemented')}>Draw Shape</button>
            <NumberInput
              label={'Area (m)'}
              readOnly
              error={errors?.area_m}
              {...register(`area_m`, {
                required: true,
                max: { value: 500000, message: 'Area cannot exceed 500,000m' }
              })}
            />
            <NumberInput
              label={'Latitude'}
              readOnly
              error={errors?.latitude}
              {...register(`latitude`, { required: true })}
            />
            <NumberInput
              label={'Longitude'}
              readOnly
              error={errors?.longitude}
              {...register(`longitude`, { required: true })}
            />
            <NumberInput
              label={'UTM Zone'}
              readOnly
              error={errors?.utm_zone}
              {...register(`utm_zone`, { required: true })}
            />
            <NumberInput
              label={'UTM Easting'}
              readOnly
              error={errors?.utm_easting}
              {...register(`utm_easting`, { required: true })}
            />
            <NumberInput
              label={'UTM Northing'}
              readOnly
              error={errors?.utm_northing}
              {...register(`utm_northing`, { required: true })}
            />
          </Fieldset>

          {/* Start Basic Information Fields */}
          <Fieldset label={'Basic Information'}>
            <DateInput
              label={'Date'}
              tooltip="The date the activity occurred on"
              error={errors?.date}
              {...register('date', { required: true, validate: (val) => noFutureDate(val) })}
            />

            <SingleSelect
              label={'Employer'}
              options={codes.EmployerCode}
              {...register('employer', { required: true })}
              error={errors?.employer}
            />

            <ArrayField<FormSchema>
              label="Funding Agencies"
              emptyValue={{ agency: '' }}
              {...register(`funding_agency`, { required: true })}
              renderRow={(index, remove) => (
                <>
                  <SingleSelect
                    options={codes.FundingAgencyCode}
                    error={errors.funding_agency?.[index]?.agency}
                    {...register(`funding_agency.${index}.agency`, { required: true })}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    <Delete color={'error'} />
                  </button>
                </>
              )}
            />
            {/* Start Jurisdictions  */}
            <ArrayField<FormSchema>
              name="jurisdictions"
              label="Jurisdictions"
              emptyValue={{ jurisdiction: '', percent_covered: 0 }}
              renderRow={(index, remove) => (
                <>
                  <SingleSelect
                    label="Jurisdiction"
                    options={codes.JurisdictionCode}
                    error={errors.jurisdictions?.[index]?.jurisdiction}
                    {...register(`jurisdictions.${index}.jurisdiction`, { required: true })}
                  />
                  <NumberInput
                    label="Percent Covered"
                    type="number"
                    error={errors.jurisdictions?.[index]?.percent_covered}
                    {...register(`jurisdictions.${index}.percent_covered`, {
                      valueAsNumber: true,
                      onChange: trigger.bind(this, 'jurisdictions')
                    })}
                  />
                  <button
                    type="button"
                    className="delete"
                    onClick={() => {
                      remove(index);
                      setTimeout(() => {
                        // Hacky, remove this
                        unregister('jurisdictions');
                        register('jurisdictions', {
                          validate: (val) => checkSum(val, 100, 'percent_covered')
                        });
                        trigger('jurisdictions');
                      }, 10);
                    }}
                  >
                    Remove
                  </button>
                </>
              )}
            />
            {/* Start Project Codes  */}
            <ArrayField<FormSchema>
              name="project_code"
              label="Project Codes"
              emptyValue={{ description: '' }}
              renderRow={(index, remove) => (
                <TextInput
                  small
                  onRemove={() => remove(index)}
                  id={`project_code.${index}.description`}
                  {...register(`project_code.${index}.description`)}
                  error={formState.errors.project_code?.[index]?.description}
                />
              )}
            />

            {/* Start General Comment Boxes  */}
            <TextArea label={'Location Description'} id="location_description" {...register('location_description')} />
            <TextArea
              label={'Access Description'}
              {...register('access_description', { required: true, minLength: 10 })}
            />
            <TextArea label={'Comment'} {...register('comment')} />
          </Fieldset>
          <SubtypeComposite />
          <input type="submit" />
          <pre style={{ display: 'flex' }}>{JSON.stringify(formData, null, 2)}</pre>
        </form>
      </FormProvider>
    </div>
  );
};

export default ActivityForm;
