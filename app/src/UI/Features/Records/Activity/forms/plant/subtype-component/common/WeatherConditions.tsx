import { useFormContext } from 'react-hook-form';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { BiocontrolReleaseSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { useSelector } from 'utils/use_selector';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { CardinalDirection } from 'UI/Features/Records/Activity/forms/enums';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';

const BiocontrolWeatherConditions = () => {
  const { register } = useFormContext<BiocontrolReleaseSchema>();
  const codes = useSelector((state) => state.ActivityPage.formCodes);
  return (
    <Fieldset label={'Weather Conditions'}>
      <NumberInput
        label={'Temperature (C°)'}
        required
        tooltip={tooltips.plant.biocontrol.weather.temperature}
        width={Width.Half}
        {...register('subtype_data.temperature', { required: true, valueAsNumber: true })}
      />
      <SingleSelect
        label={'Cloud Cover'}
        name={'subtype_data.cloud_cover'}
        options={codes?.CloudCoverCode}
        required
        width={Width.Half}
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.weather.cloud_cover}
      />
      <SingleSelect
        label={'Precipitation'}
        name={'subtype_data.precipitation'}
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
        {...register('subtype_data.wind_speed_kmh', { required: true, valueAsNumber: true })}
      />
      <SingleSelect
        label={'Wind Direction'}
        name={'subtype_data.wind_direction'}
        options={CardinalDirection}
        required
        width={Width.Half}
        rules={{ required: true }}
        tooltip={tooltips.plant.biocontrol.weather.wind_direction}
      />
      <TextArea label={'Weather Comments'} width={Width.Half} {...register('subtype_data.comments')} />
    </Fieldset>
  );
};
export default BiocontrolWeatherConditions;
