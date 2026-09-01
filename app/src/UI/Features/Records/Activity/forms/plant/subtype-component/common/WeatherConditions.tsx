import { useFormContext, get } from 'react-hook-form';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { BiocontrolReleaseSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';
import { greaterThanEqual } from 'UI/Features/Records/Activity/forms/common/validators';

const BiocontrolWeatherConditions = () => {
  const validateWindDirectionAndSpeed = (wind_direction: string, formValues) => {
    const wind_speed = formValues.subtype_data.weather_conditions?.wind_speed_kmh;
    if (wind_speed === undefined || wind_direction === undefined) return true;
    if (wind_speed > 0 && wind_direction === 'No Wind') {
      return 'Must specify a wind direction when wind speed is > 0';
    }
    return true;
  };
  const { getPath } = useFieldPath<BiocontrolReleaseSchema>('subtype_data.weather_conditions');
  const {
    register,
    formState: { errors }
  } = useFormContext<BiocontrolReleaseSchema>();
  const codes = useSelector((state) => state.ActivityPage.formCodes);

  return (
    <Fieldset label={'Weather Conditions'}>
      <NumberInput
        label={'Temperature (C°)'}
        required
        error={get(errors, getPath('temperature'))}
        tooltip={tooltips.plant.biocontrol.weather.temperature}
        width={Width.Half}
        {...register(getPath('temperature'), {
          required: true,
          valueAsNumber: true
        })}
      />
      <SingleSelect
        label={'Cloud Cover'}
        name={getPath('cloud_cover')}
        options={codes?.CloudCoverCode}
        required
        width={Width.Half}
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.weather.cloud_cover}
      />
      <SingleSelect
        label={'Precipitation'}
        name={getPath('precipitation')}
        options={codes?.PrecipitationCode}
        required
        width={Width.Half}
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.weather.precipitation}
      />
      <NumberInput
        label={'Wind Speed (km/h)'}
        required
        error={get(errors, getPath('wind_speed_kmh'))}
        tooltip={tooltips.plant.biocontrol.weather.wind_speed}
        width={Width.Half}
        {...register(getPath('wind_speed_kmh'), {
          required: true,
          valueAsNumber: true,
          validate: (v) => greaterThanEqual(v, 0),
          deps: [getPath('wind_direction')]
        })}
      />
      <SingleSelect
        label={'Wind Direction'}
        name={getPath('wind_direction')}
        options={codes?.WindDirectionCode}
        required
        width={Width.Half}
        rules={{
          required: true,
          validate: {
            checkSpeedAndDirection: (v, formValues) => validateWindDirectionAndSpeed(v, formValues)
          }
        }}
        tooltip={tooltips.plant.biocontrol.weather.wind_direction}
      />
      <TextArea
        label={'Weather Comments'}
        error={get(errors, getPath('comments'))}
        width={Width.Half}
        {...register(getPath('comments'))}
      />
    </Fieldset>
  );
};
export default BiocontrolWeatherConditions;
