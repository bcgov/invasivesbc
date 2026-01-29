import Fieldset from 'common-components/inputs/Fieldset';
import { SubtypeData } from 'constants';
import MonitoringInfo from './common/MonitoringInfo';
import NearestWells from './common/NearestWells';

const ChemicalMonitoring = ({ subtypeData }: SubtypeData) => {
  console.log(subtypeData);
  return (
    <>
      <NearestWells data={subtypeData?.nearest_wells} />
      <Fieldset label={'Monitoring Information'}>
        {subtypeData?.treatment_monitoring_information?.map((d) => (
          <MonitoringInfo data={d} />
        ))}
      </Fieldset>
    </>
  );
};

export default ChemicalMonitoring;
