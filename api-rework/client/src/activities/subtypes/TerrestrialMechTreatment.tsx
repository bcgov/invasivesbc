import { SubtypeData } from 'constants';
import MechTreatmentInfo from './common/MechTreatmentInfo';

const TerrestrialMechTreatment = ({ subtypeData }: SubtypeData) => (
  <MechTreatmentInfo treatmentInfo={subtypeData?.mechanical_treatments} />
);
export default TerrestrialMechTreatment;
