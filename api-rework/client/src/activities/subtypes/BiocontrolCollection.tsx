import Fieldset from 'common-components/inputs/Fieldset';
import MicrositeConditions from './common/MicrositeConditions';
import TargetPlantPhenology from './common/TargetPlantPhenology';
import WeatherConditions from './common/WeatherConditions';
import TextInput from 'common-components/inputs/TextInput';
import Spacer from 'common-components/inputs/Spacer';
import TextField from 'common-components/inputs/TextField';

const BiocontrolCollection = ({ subtypeData }) => {
  return (
    <>
      <WeatherConditions subtypeData={subtypeData.weather_conditions} />
      <MicrositeConditions microsite_conditions={subtypeData.microsite_conditions} />
      <Fieldset label={'Collection Information'}>
        {!!subtypeData?.entries?.length && <p>No Data</p>}
        {subtypeData?.entries?.map((ci) => (
          <div className="group-wrap" key={ci?.invasive_plant + ci?.biological_agent}>
            <TextInput label={'invasive plant'} value={ci?.invasive_plant} />
            <TextInput label={'biological agent'} value={ci?.biological_agent} />
            <TextInput label={'historical iapp site'} value={ci?.historical_iapp_site} />
            <TextInput label={'collection type'} value={ci?.collection_type} />
            <TextInput label={'plant count collection'} value={ci?.plant_count_collection} />
            <TextInput label={'time collection duration minutes'} value={ci?.time_collection_duration_minutes} />
            <TextInput label={'collection method'} value={ci?.collection_method} />
            <TextInput label={'number of sweeps'} value={ci?.number_of_sweeps} />
            <TextInput label={'start time collecting'} value={ci?.start_time_collecting} />
            <TextInput label={'end time collecting'} value={ci?.end_time_collecting} />
            <TextField label={'comment'} value={ci?.comment} />
            <Spacer />

            <Fieldset small label={'Actual Biological Agents'}>
              {ci.actual_biological_agents?.map((ba) => (
                <div className="group-wrap">
                  <TextInput label={'Life stage'} value={ba?.stage} />
                  <TextInput label={'Quantity'} value={ba?.quantity} />
                </div>
              ))}
            </Fieldset>
            <Fieldset small label={'Estimated Biological Agents'}>
              {ci.estimated_biological_agents?.map((ba) => (
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

export default BiocontrolCollection;
