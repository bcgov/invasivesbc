import TextInput from 'common-components/inputs/TextInput';
import { SubtypeData } from 'constants';
import Fieldset from 'common-components/inputs/Fieldset';
import ChemTreatmentInfo from './common/ChemTreatmentInfo';

const TerrestrialChemTreatment = ({ subtypeData }: SubtypeData) => {
  return (
    <>
      <ChemTreatmentInfo subtypeData={subtypeData} />
      <Fieldset label={'Chem Treatment Details'}>
        <TextInput value={subtypeData?.chem_treatment_details} />
      </Fieldset>
    </>
  );
};
export default TerrestrialChemTreatment;
