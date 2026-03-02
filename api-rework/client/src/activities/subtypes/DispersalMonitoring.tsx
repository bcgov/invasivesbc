import { SubtypeData } from 'constants';
import BiocontrolMonitoring from './common/BiocontrolMonitoring';
import WeatherConditions from './common/WeatherConditions';
import TargetPlantPhenology from './common/TargetPlantPhenology';
import MicrositeConditions from './common/MicrositeConditions';

const DispersalMonitoring = ({ subtypeData }: SubtypeData) => {
  return (
    <>
      <WeatherConditions subtypeData={subtypeData} />
      <MicrositeConditions microsite_conditions={subtypeData} />
      <BiocontrolMonitoring entries={subtypeData?.entries} />
      <TargetPlantPhenology targetPlantPhenology={subtypeData?.target_plant_phenology} />
    </>
  );
};

export default DispersalMonitoring;
