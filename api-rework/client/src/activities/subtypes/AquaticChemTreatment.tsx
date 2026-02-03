import TextInput from 'common-components/inputs/TextInput';
import { SubtypeData } from 'constants';
import Fieldset from 'common-components/inputs/Fieldset';
import ChemTreatmentInfo from './common/ChemTreatmentInfo';

const AquaticChemTreatment = ({ subtypeData }: SubtypeData) => {
  return (
    <>
      <ChemTreatmentInfo subtypeData={subtypeData} />
      <Fieldset label={'Chem Treatment Details'}>
        <TextInput value={subtypeData?.entries} />
      </Fieldset>
    </>
  );
};
export default AquaticChemTreatment;
