import { useDispatch } from 'utils/use_selector';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import DateInput from 'UI/Features/Records/Activity/forms/common/DateInput/DateInput';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import {
  checkSum,
  maxValue,
  minArrayLength,
  minValue,
  noFutureDate,
  noRepeatKey
} from 'UI/Features/Records/Activity/forms/common/validators';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import SubtypeComposite from 'UI/Features/Records/Activity/forms/plant/subtype-component/SubtypeComposite';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import Alerts from 'state/actions/alerts/Alerts';
import tripAlertMessages from 'constants/alerts/tripAlerts';
import Prompt from 'state/actions/prompts/Prompt';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import Participants from './Participants';
import { Feature } from 'geojson';
import { UtmInputObj } from 'interfaces/prompt-interfaces';
import GeoShapes from 'constants/geoShapes';
import MapActions from 'state/actions/map';
import DrawToolActions from 'state/actions/drawtool/drawToolActions';
import FundingAgency from './FundingAgency';
import Employer from './Employers';
import LinkedActivities from './LinkedActivities';
import FormSpacer from 'UI/Features/Records/Activity/forms/common/FormSpacer/FormSpacer';
import { useFormContext } from 'react-hook-form';
import useSuggestedJurisdictionCodes from 'UI/Features/Records/Activity/forms/plant/hooks/useSuggestedJurisdictionCodes';
import AdvisoryMessage from 'UI/Features/Records/Activity/forms/common/AdvisoryMessage/AdvisoryMessage';
import './activityForm.css';

const Form = () => {
  const {
    register,
    formState: { disabled, errors }
  } = useFormContext<FormSchema>();
  const dispatch = useDispatch();
  const { jurisdictionCodes } = useSuggestedJurisdictionCodes();
  /**
   * @desc Initiate Mouseclick on Polygon draw icon, alert user to start drawing
   */
  const handleDrawStart = () => {
    (document.getElementsByClassName('mapbox-gl-draw_polygon')?.[0] as HTMLButtonElement).click();
    dispatch(Alerts.create(tripAlertMessages.drawToolClicked));
  };

  /**
   * @desc Handler for creating a manual UTM Entry initiated by user
   */
  const handleManualUTM = () => {
    const utmCallback = (input: UtmInputObj) => {
      const [lng, lat] = input.results;
      const geo: Feature = {
        type: 'Feature',
        geometry: {
          type: GeoShapes.Point,
          coordinates: [lng, lat]
        },
        properties: {}
      };
      dispatch(MapActions.centerMap({ lat, lng, zoom: 16 }));
      dispatch(DrawToolActions.updateGeo([geo]));
    };

    dispatch(
      Prompt.utm({
        title: 'Enter a manual UTM',
        prompt: 'Fill in the fields below to create your own UTM Coordinates',
        callback: utmCallback
      })
    );
  };
  return (
    <>
      {!disabled && (
        <span className="required-advisory">
          <AdvisoryMessage text={'All fields are required unless otherwise indicated.'} />
        </span>
      )}
      {/* Start of Geometry Fields */}
      <Fieldset label={'Geometry Information'}>
        <NumberInput
          label={'Area (m²)'}
          readOnly
          error={errors?.area_m}
          required
          tooltip={tooltips.basic.area_m}
          {...register(`area_m`, {
            required: true,
            valueAsNumber: true,
            min: { value: 1, message: 'Area must be greater than 1m' },
            max: { value: 500000, message: 'Area cannot exceed 500,000m' }
          })}
          width={Width.Third}
        />
        <NumberInput
          label={'Latitude'}
          readOnly
          required
          error={errors?.latitude}
          tooltip={tooltips.basic.latitude}
          {...register(`latitude`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => !!val
          })}
          width={Width.Third}
        />
        <NumberInput
          label={'Longitude'}
          readOnly
          required
          tooltip={tooltips.basic.longitude}
          error={errors?.longitude}
          {...register(`longitude`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => !!val
          })}
          width={Width.Third}
        />
        <NumberInput
          label={'UTM Zone'}
          readOnly
          required
          error={errors?.utm_zone}
          tooltip={tooltips.basic.utm_zone}
          {...register(`utm_zone`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => !!val
          })}
          width={Width.Third}
        />
        <NumberInput
          label={'UTM Easting'}
          readOnly
          required
          tooltip={tooltips.basic.utm_easting}
          error={errors?.utm_easting}
          {...register(`utm_easting`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => !!val
          })}
          width={Width.Third}
        />
        <NumberInput
          label={'UTM Northing'}
          readOnly
          required
          tooltip={tooltips.basic.utm_northing}
          error={errors?.utm_northing}
          {...register(`utm_northing`, {
            required: true,
            valueAsNumber: true,
            validate: (val) => !!val
          })}
          width={Width.Third}
        />
        <p>To modify or update, please draw a new shape on the Map</p>
        <div className="control">
          <input
            type="button"
            className="control-button"
            disabled={disabled}
            onClick={handleDrawStart}
            value="Start Drawing"
          />
          <input
            type="button"
            className="control-button"
            disabled={disabled}
            onClick={handleManualUTM}
            value="Enter UTM"
          />
        </div>
      </Fieldset>
      <LinkedActivities />
      {/* Start Basic Information Fields */}
      <Fieldset label={'Basic Information'}>
        <DateInput
          label={'Date'}
          tooltip={tooltips.basic.date}
          required
          error={errors?.date}
          {...register('date', { required: true, validate: (val) => noFutureDate(val) })}
          width={Width.Half}
        />
        <Employer width={Width.Half} />
        <FundingAgency width={Width.Half} />
        <FormSpacer width={Width.Half} />
        {/* Start of Jurisdictions section */}
        <ArrayField<FormSchema, 'jurisdictions'>
          name="jurisdictions"
          label="Jurisdictions"
          rules={{
            validate: {
              minimumItems: (val) => minArrayLength(val, 1),
              totalPercent: (val) => checkSum(val, 100, 'percent_covered'),
              noRepeatJurisdiction: (val) => noRepeatKey(val, 'jurisdiction')
            }
          }}
          width={Width.Half}
          emptyValue={{ jurisdiction: '', percent_covered: 0 }}
          renderRow={(index) => (
            <>
              <SingleSelect
                label="Jurisdiction"
                options={jurisdictionCodes}
                tooltip={tooltips.basic.jurisdiction}
                name={`jurisdictions.${index}.jurisdiction`}
                rules={{ required: true }}
                required
              />
              <NumberInput
                label="Percent Covered"
                type="number"
                required
                tooltip={tooltips.basic.jurisdiction_percent_covered}
                error={errors.jurisdictions?.[index]?.percent_covered}
                {...register(`jurisdictions.${index}.percent_covered`, {
                  required: true,
                  valueAsNumber: true,
                  validate: {
                    min: (val) => minValue(val, 1),
                    max: (val) => maxValue(val, 100)
                  }
                })}
              />
            </>
          )}
        />
        {/* Start of Project Codes  */}
        <ArrayField<FormSchema, 'projects'>
          name="projects"
          label="Project Codes"
          tooltip={tooltips.basic.projects}
          emptyValue={{ description: '' }}
          width={Width.Half}
          renderRow={(index) => (
            <TextInput
              label="Description"
              required
              placeholder="Project Code"
              id={`projects.${index}.description`}
              {...register(`projects.${index}.description`, { required: true })}
              error={errors.projects?.[index]?.description}
            />
          )}
        />

        {/* Start General Comment Boxes  */}
        <TextArea
          label={'Location Description'}
          id="location_description"
          error={errors?.location_description}
          required
          tooltip={tooltips.basic.location_description}
          width={Width.Third}
          {...register('location_description', {
            required: true,
            validate: (val) => minValue(val, 10)
          })}
        />
        <TextArea
          width={Width.Third}
          label={'Access Description'}
          error={errors?.access_description}
          tooltip={tooltips.basic.access_description}
          {...register('access_description')}
        />
        <TextArea
          label={'Comment'}
          error={errors?.comment}
          tooltip={tooltips.basic.general_comments}
          width={Width.Third}
          {...register('comment')}
        />
      </Fieldset>
      <Participants />
      <SubtypeComposite />
    </>
  );
};

export default Form;
