import Fieldset from 'common-components/inputs/Fieldset';
import { SubtypeData } from 'constants';
import MonitoringInfo from './common/MonitoringInfo';
import NearestWells from './common/NearestWells';

const ChemicalMonitoring = ({ subtypeData }: SubtypeData) => {
  return (
    <>
      <NearestWells data={subtypeData?.well_entries} />
      <Fieldset label={'Monitoring Information'}>
        {subtypeData?.entries?.map((d) => (
          <MonitoringInfo data={d} />
        ))}
      </Fieldset>
    </>
  );
};

export default ChemicalMonitoring;
