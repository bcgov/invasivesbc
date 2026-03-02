import { ActivitySubtypes } from 'sharedAPI';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { BiocontrolReleaseSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import MicrositeConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/MicrositeConditions';
import BiocontrolWeatherConditions from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/WeatherConditions';
import BiocontrolReleaseEntry from './BiocontrolReleaseEntry';
import { minArrayLength } from 'UI/Features/Records/Activity/forms/common/validators';
import TargetPlantPhenology from 'UI/Features/Records/Activity/forms/plant/subtype-component/common/TargetPlantPhenology';

const BiocontrolRelease = () => {
  return (
    <>
      <BiocontrolWeatherConditions />
      <MicrositeConditions />
      <ArrayField<BiocontrolReleaseSchema, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label={'Biocontrol Treatments'}
        emptyValue={getDefaultFormState(ActivitySubtypes.Biocontrol_Release).subtype_data.entries[0]}
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1)
          }
        }}
        renderRow={(index, remove) => <BiocontrolReleaseEntry index={index} remove={remove} />}
      />
      <TargetPlantPhenology />
    </>
  );
};

export default BiocontrolRelease;
