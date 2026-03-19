import { useSelector } from 'utils/use_selector';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import {
  MonitoringChemPlantSchema,
  MonitoringMechPlantSchema
} from 'UI/Features/Records/Activity/forms/plant/interfaces';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { minArrayLength, noRepeatKey } from 'UI/Features/Records/Activity/forms/common/validators';
import MonitoringChemMechPlantEntry from './MonitoringChemMechPlantEntry';

const MonitoringChemMechPlant = () => {
  const subtype = useSelector((state) => state.ActivityPage?.formType);
  return (
    <ArrayField<MonitoringChemPlantSchema | MonitoringMechPlantSchema, 'subtype_data.entries'>
      name={'subtype_data.entries'}
      label={'Monitoring Information'}
      emptyValue={getDefaultFormState(subtype).subtype_data.entries[0]}
      rules={{
        validate: {
          minLength: (arr) => minArrayLength(arr, 1),
          noDupePlant: (arr) => noRepeatKey(arr, 'invasive_plant', 'Terrestrial Plant'),
          noDupeAquaticPlant: (arr) => noRepeatKey(arr, 'invasive_plant_aquatic', 'Aquatic Invasive Plant')
        }
      }}
      renderRow={(index) => <MonitoringChemMechPlantEntry index={index} />}
    />
  );
};

export default MonitoringChemMechPlant;
