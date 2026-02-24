import { useSelector } from 'utils/use_selector';
import ArrayField from '../../../common/ArrayField/ArrayField';
import { MonitoringChemPlantSchema, MonitoringMechPlantSchema } from '../../interfaces';
import getDefaultFormState from '../../builders/getDefaultState';
import { minArrayLength, noRepeatKey } from '../../../common/validators';
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
      renderRow={(index, remove) => <MonitoringChemMechPlantEntry index={index} remove={remove} />}
    />
  );
};

export default MonitoringChemMechPlant;
