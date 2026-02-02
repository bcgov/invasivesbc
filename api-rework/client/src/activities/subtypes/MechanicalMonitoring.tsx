import Fieldset from 'common-components/inputs/Fieldset';
import { SubtypeData } from 'constants';
import MonitoringInfo from './common/MonitoringInfo';

const MechanicalMonitoring = ({ subtypeData }: SubtypeData) => (
  <Fieldset label={'Monitoring Information'}>
    {subtypeData?.treatment_monitoring_information?.map((d) => (
      <MonitoringInfo data={d} />
    ))}
  </Fieldset>
);

export default MechanicalMonitoring;
