import { ActivitySubtypes } from 'sharedAPI';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { BiocontrolCollectionSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import MicrositeConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/MicrositeConditions';
import TargetPlantPhenology from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/TargetPlantPhenology';
import BiocontrolWeatherConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/WeatherConditions';
import BiocontrolCollectionEntry from './BiocontrolCollectionEntry';

const BiocontrolCollection = () => {
  return (
    <>
      <BiocontrolWeatherConditions />
      <MicrositeConditions />
      <ArrayField<BiocontrolCollectionSchema, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label={'Biocontrol Collection'}
        emptyValue={getDefaultFormState(ActivitySubtypes.Biocontrol_Collection).subtype_data.entries[0]}
        renderRow={(index, remove) => <BiocontrolCollectionEntry index={index} remove={remove} />}
      />
      <TargetPlantPhenology />
    </>
  );
};

export default BiocontrolCollection;
