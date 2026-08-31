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
  const getEmptyEntry = (): BiocontrolReleaseSchema['subtype_data']['entries'][0] => {
    return (getDefaultFormState(ActivitySubtypes.Biocontrol_Release) as BiocontrolReleaseSchema).subtype_data
      .entries[0];
  };
  return (
    <>
      <BiocontrolWeatherConditions />
      <MicrositeConditions />
      <ArrayField<BiocontrolReleaseSchema, 'subtype_data.entries'>
        name={'subtype_data.entries'}
        label={'Biocontrol Treatments'}
        emptyValue={() => getEmptyEntry()}
        rules={{
          validate: {
            minLength: (val) => minArrayLength(val, 1)
          }
        }}
        renderRow={(index) => <BiocontrolReleaseEntry index={index} />}
      />
      <TargetPlantPhenology />
    </>
  );
};

export default BiocontrolRelease;
