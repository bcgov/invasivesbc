import { SubtypeData } from 'constants';
import ChemTreatmentInfo from './common/ChemTreatmentInfo';

const TerrestrialChemTreatment = ({ subtypeData }: SubtypeData) => {
  return <ChemTreatmentInfo subtypeData={subtypeData} />;
};
export default TerrestrialChemTreatment;
