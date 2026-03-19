import { ActivitySubtypes } from 'sharedAPI';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import { distinctEntries } from 'UI/Features/Records/Activity/forms/common/validators';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { BiocontrolDispersalMonitoringSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import MicrositeConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/MicrositeConditions';
import BiocontrolWeatherConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/WeatherConditions';
import TargetPlantPhenology from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/TargetPlantPhenology';
import BiocontrolDispersalMonitoringEntry from './BiocontrolDispersalMonitoringEntry';

const BiocontrolDispersalMonitoring = () => {
  return (
    <>
      <BiocontrolWeatherConditions />
      <MicrositeConditions />
      <ArrayField<BiocontrolDispersalMonitoringSchema, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label={'Biological Dispersal Information'}
        rules={{
          required: true,
          validate: (arr) =>
            distinctEntries(
              arr,
              ['biocontrol_agent', 'invasive_plant'],
              'Entries must contain unique Agents and Plants'
            )
        }}
        emptyValue={getDefaultFormState(ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial)}
        renderRow={(index) => <BiocontrolDispersalMonitoringEntry index={index} />}
      />
      <TargetPlantPhenology />
    </>
  );
};
export default BiocontrolDispersalMonitoring;
