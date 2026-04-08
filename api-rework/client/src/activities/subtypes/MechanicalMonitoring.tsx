import Fieldset from 'common-components/inputs/Fieldset';
import { SubtypeData } from 'constants';
import MonitoringInfo from './common/MonitoringInfo';

const MechanicalMonitoring = ({ subtypeData }: SubtypeData) => (
  <Fieldset label={'Monitoring Information'}>
    {subtypeData?.terrestrial_entries?.map((d) => (
      <MonitoringInfo data={d} key={d.invasive_plant} />
    ))}
    {subtypeData?.aquatic_entries?.map((d) => (
      <MonitoringInfo data={d} key={d.invasive_plant} />
    ))}
  </Fieldset>
);

export default MechanicalMonitoring;
