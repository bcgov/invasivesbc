import { SubtypeData } from 'constants';
import MechTreatmentInfo from './common/MechTreatmentInfo';

const TerrestrialMechTreatment = ({ subtypeData }: SubtypeData) => <MechTreatmentInfo entries={subtypeData?.entries} />;
export default TerrestrialMechTreatment;
