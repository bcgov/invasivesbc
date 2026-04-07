import { SubtypeData } from 'constants';
import WeatherConditions from './common/WeatherConditions';
import MicrositeConditions from './common/MicrositeConditions';
import TargetPlantPhenology from './common/TargetPlantPhenology';
import Fieldset from 'common-components/inputs/Fieldset';
import TextInput from 'common-components/inputs/TextInput';

const BiocontrolRelease = ({ subtypeData }: SubtypeData) => {
  return (
    <>
      <WeatherConditions subtypeData={subtypeData.weather_conditions} />
      <MicrositeConditions microsite_conditions={subtypeData.microsite_conditions} />
      <Fieldset label={'Treatment Information'}>
        {!!subtypeData?.entries?.length && <p>No Data</p>}
        {subtypeData?.entries?.map((ti) => (
          <div className="group-wrap">
            <TextInput label={'agent source'} value={ti.agent_source} />
            <TextInput label={'biocontrol agent'} value={ti.biocontrol_agent} />
            <TextInput label={'collection date'} value={ti.collection_date} />
            <TextInput label={'linear segment'} value={ti.linear_segment} />
            <TextInput label={'invasive plant'} value={ti.invasive_plant} />
            <TextInput label={'mortality'} value={ti.mortality} />
            <TextInput label={'plant collected from'} value={ti.plant_collected_from} />
            <TextInput label={'plant collected from manual'} value={ti.plant_collected_from_manual} />

            <Fieldset small label={'Actual Biological Agents'}>
              {ti.actual_biological_agents?.map((ba) => (
                <div className="group-wrap">
                  <TextInput label={'Life stage'} value={ba?.stage} />
                  <TextInput label={'Quantity'} value={ba?.quantity} />
                </div>
              ))}
            </Fieldset>
            <Fieldset small label={'Estimated Biological Agents'}>
              {ti.estimated_biological_agents?.map((ba) => (
                <div className="group-wrap">
                  <TextInput label={'Life stage'} value={ba?.stage} />
                  <TextInput label={'Quantity'} value={ba?.quantity} />
                </div>
              ))}
            </Fieldset>
          </div>
        ))}
      </Fieldset>
      <TargetPlantPhenology targetPlantPhenology={subtypeData?.target_plant_phenology} />
    </>
  );
};

export default BiocontrolRelease;
