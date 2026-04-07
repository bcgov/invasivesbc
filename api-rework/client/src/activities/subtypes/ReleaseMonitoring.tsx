import Fieldset from 'common-components/inputs/Fieldset';
import TextInput from 'common-components/inputs/TextInput';
import { SubtypeData } from 'constants';
import BiocontrolMonitoring from './common/BiocontrolMonitoring';
import TargetPlantPhenology from './common/TargetPlantPhenology';
import MicrositeConditions from './common/MicrositeConditions';
import WeatherConditions from './common/WeatherConditions';

const ReleaseMonitoring = ({ subtypeData }: SubtypeData) => (
  <>
    <MicrositeConditions microsite_conditions={subtypeData.microsite_conditions} />
    <WeatherConditions subtypeData={subtypeData?.weather_conditions} />
    <BiocontrolMonitoring entries={subtypeData.entries} />
    <TargetPlantPhenology targetPlantPhenology={subtypeData?.target_plant_phenology} />
    <Fieldset label={'Spread Results'}>
      <TextInput
        label={'Spread details recorded'}
        value={subtypeData?.max_spread_distance_m != undefined ? 'Yes' : 'No'}
      />
      <TextInput label={'Agent density (%)'} value={subtypeData?.agent_density} />
      <TextInput label={'Plant Attack (%)'} value={subtypeData?.plant_attack} />
      <TextInput label={'max spread distance (m)'} value={subtypeData?.max_spread_distance_m} />
      <TextInput label={'max spread aspect (deg)'} value={subtypeData?.max_spread_aspect_deg} />
    </Fieldset>
  </>
);

export default ReleaseMonitoring;
