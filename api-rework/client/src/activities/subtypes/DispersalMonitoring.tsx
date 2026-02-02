import { SubtypeData } from 'constants';
import BiocontrolMonitoring from './common/BiocontrolMonitoring';
import WeatherConditions from './common/WeatherConditions';
import TextInput from 'common-components/inputs/TextInput';
import Fieldset from 'common-components/inputs/Fieldset';
import TargetPlantPhenology from './common/TargetPlantPhenology';

const DispersalMonitoring = ({ subtypeData }: SubtypeData) => {
  return (
    <>
      <WeatherConditions subtypeData={subtypeData} />
      <Fieldset label={'microsite conditions'}>
        <TextInput label={'site surface shape'} value={subtypeData?.microsite_conditions?.site_surface_shape} />
        <TextInput label={'mesoslope position'} value={subtypeData?.microsite_conditions?.mesoslope_position} />
      </Fieldset>
      <BiocontrolMonitoring monitoring_information={subtypeData?.monitoring_information} />
      <TargetPlantPhenology targetPlantPhenology={subtypeData?.target_plant_phenology} />
    </>
  );
};

export default DispersalMonitoring;
