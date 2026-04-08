import Fieldset from 'common-components/inputs/Fieldset';
import { SubtypeData } from 'constants';
import MonitoringInfo from './common/MonitoringInfo';
import NearestWells from './common/NearestWells';

const ChemicalMonitoring = ({ subtypeData }: SubtypeData) => {
  return (
    <>
      <NearestWells data={subtypeData?.well_entries} />
      <Fieldset label={'Monitoring Information'}>
        {subtypeData?.aquatic_entries?.map((d) => (
          <MonitoringInfo data={d} key={d.invasive_plant} />
        ))}
        {subtypeData?.terrestrial_entries?.map((d) => (
          <MonitoringInfo data={d} key={d.invasive_plant} />
        ))}
      </Fieldset>
    </>
  );
};

export default ChemicalMonitoring;
