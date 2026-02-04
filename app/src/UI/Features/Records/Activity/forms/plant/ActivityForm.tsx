import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { useSelector } from 'utils/use_selector';

import './activityForm.css';
import TextInput from './common/TextInput';
import SingleSelect from './common/SingleSelect';

type Inputs = {
  date: string;
  area_m: number;
  latitude: number;
  longitude: number;
  utm_zone: number;
  utm_easting: number;
  utm_northing: number;
  employer: string[];
  funding_agency: string;
  jurisdictions: { percent_covered: number; jurisdiction: string }[];
  location_description: string;
  access_description: string;
  project_code: { description: string }[];
  comment: string;
};
const ActivityForm = () => {
  const { register, handleSubmit, watch, getValues, control, formState } = useForm<Inputs>({
    defaultValues: {
      jurisdictions: [{ jurisdiction: '', percent_covered: 0 }]
    }
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);
  const {
    fields: projectCodeFields,
    append: appendProjectCode,
    remove: removeProjectCode
  } = useFieldArray({
    control,
    name: 'project_code'
  });
  const {
    fields: jurisdictionFields,
    append: appendJurisdiction,
    remove: removeJurisdiction
  } = useFieldArray({
    control,
    name: 'jurisdictions'
  });
  const codes = useSelector((state) => state.ActivityPage?.codes);
  console.log(codes.EmployerCode);
  return (
    <form className="activity-form" onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <legend>Basic Information</legend>
        <label htmlFor="date">date</label>
        <input id="date" type="date" {...register('date')} />
        <TextInput label={'Area (m)'} error={formState.errors.area_m} {...register(`area_m`)} />
        <TextInput label={'Latitude'} error={formState.errors.latitude} {...register(`latitude`)} />
        <TextInput label={'Longitude'} error={formState.errors.longitude} {...register(`longitude`)} />
        <TextInput label={'UTM Zone'} error={formState.errors.utm_zone} {...register(`utm_zone`)} />
        <TextInput label={'UTM Easting'} error={formState.errors.utm_easting} {...register(`utm_easting`)} />
        <TextInput label={'UTM Northing'} error={formState.errors.utm_northing} {...register(`utm_northing`)} />
        <TextInput label={'Percent Covered'} error={formState.errors.area_m} {...register(`area_m`)} />
        <TextInput label={'Percent Covered'} error={formState.errors.area_m} {...register(`area_m`)} />
        <TextInput label={'Percent Covered'} error={formState.errors.area_m} {...register(`area_m`)} />
        <label>Employer</label>
        <select {...register(`employer`)}>
          {codes.EmployerCode?.map((code) => (
            <option value={code.code}>{code.full_name}</option>
          ))}
        </select>
        <label>Funding Agency</label>
        <SingleSelect
          label={'Funding Agency'}
          error={formState.errors?.funding_agency}
          {...register(`funding_agency`)}
          options={codes.FundingAgencyCode}
        />
        <label htmlFor="jurisdictions">Jurisdictions</label>
        {jurisdictionFields.map((field, index) => (
          <div key={field.id}>
            <SingleSelect
              label={'Jurisdiction'}
              error={formState.errors.jurisdictions?.[index]?.jurisdiction}
              {...register(`jurisdictions.${index}.jurisdiction`)}
              options={codes.JurisdictionCode}
            />
            <TextInput
              label={'Percent Covered'}
              error={formState.errors.jurisdictions?.[index]?.percent_covered}
              {...register(`jurisdictions.${index}.percent_covered`)}
            />
            <button type="button" onClick={() => removeJurisdiction(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => appendJurisdiction({ percent_covered: 0, jurisdiction: '' })}>
          Add
        </button>
        <label htmlFor="location_description">location description</label>
        <textarea id="location_description" rows={4} {...register('location_description')} />
        <label htmlFor="access_description">access description</label>
        <textarea id="access_description" rows={4} {...register('access_description')} />
        {projectCodeFields.map((field, index) => (
          <div>
            <label id={`project_code.${index}.description`} htmlFor={`project_code.${index}.description`}>
              Project Code:
            </label>
            <input
              id={`project_code.${index}.description`}
              type="text"
              {...register(`project_code.${index}.description`)}
            />
            <button type="button" onClick={() => removeProjectCode(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => appendProjectCode({ description: '' })}>
          +
        </button>
        <input id="project_code" type="text" {...register('project_code')} />
        <label htmlFor="comment">comment</label>
        <input id="comment" type="text" {...register('comment')} />
      </fieldset>
      <input type="submit" disabled={Object.keys(formState.errors).length !== 0} />
      <button
        onClick={(e) => {
          e.preventDefault();
          console.dir(getValues());
        }}
      >
        Print in Console
      </button>
    </form>
  );
};

export default ActivityForm;
