import { useFormContext } from 'react-hook-form';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { BiocontrolReleaseSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import useFieldPath from 'UI/Features/Records/Activity/forms/plant/hooks/useFieldPath';

const BiocontrolWeatherConditions = () => {
  const { getPath } = useFieldPath<BiocontrolReleaseSchema>('subtype_data.weather_conditions');
  const { register } = useFormContext<BiocontrolReleaseSchema>();
  const codes = useSelector((state) => state.ActivityPage.formCodes);

  return (
    <Fieldset label={'Weather Conditions'}>
      <NumberInput
        label={'Temperature (C°)'}
        required
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
        tooltip={tooltips.plant.biocontrol.weather.wind_speed}
        width={Width.Half}
        {...register(getPath('wind_speed_kmh'), { required: true, valueAsNumber: true })}
      />
      <SingleSelect
        label={'Wind Direction'}
        name={getPath('wind_direction')}
        options={codes?.WindDirectionCode}
        required
        width={Width.Half}
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.weather.wind_direction}
      />
      <TextArea label={'Weather Comments'} width={Width.Half} {...register(getPath('comments'))} />
    </Fieldset>
  );
};
export default BiocontrolWeatherConditions;
