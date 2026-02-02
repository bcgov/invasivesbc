import Fieldset from 'common-components/inputs/Fieldset';
import TextInput from 'common-components/inputs/TextInput';
import { SubtypeData } from 'constants';

const WeatherConditions = ({ subtypeData }: SubtypeData) => {
  return (
    <Fieldset label={'Weather Conditions'}>
      <TextInput label={'comments'} value={subtypeData?.comments} />
      <TextInput label={'cloud_cover'} value={subtypeData?.cloud_cover} />
      <TextInput label={'precipitation'} value={subtypeData?.precipitation} />
      <TextInput label={'temperature'} value={subtypeData?.temperature} />
      <TextInput label={'wind_direction'} value={subtypeData?.wind_direction} />
      <TextInput label={'wind_speed_kmh'} value={subtypeData?.wind_speed_kmh} />
    </Fieldset>
  );
};

export default WeatherConditions;
