import TextInput from 'common-components/inputs/TextInput';
import { SubtypeData } from 'constants';
import Fieldset from 'common-components/inputs/Fieldset';
import ChemTreatmentInfo from './common/ChemTreatmentInfo';

const AquaticChemTreatment = ({ subtypeData }: SubtypeData) => <ChemTreatmentInfo subtypeData={subtypeData} />;
export default AquaticChemTreatment;
