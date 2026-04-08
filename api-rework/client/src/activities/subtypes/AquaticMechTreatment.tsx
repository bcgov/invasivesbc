import Fieldset from 'common-components/inputs/Fieldset';
import { SubtypeData } from 'constants';
import MechTreatmentInfo from './common/MechTreatmentInfo';
import TextInput from 'common-components/inputs/TextInput';
import Spacer from 'common-components/inputs/Spacer';

const AquaticMechTreatment = ({ subtypeData }: SubtypeData) => (
  <>
    <Fieldset label={'Authorization Info'}>
      <TextInput value={subtypeData?.authorization_info} />
    </Fieldset>
    <Spacer />
    <Fieldset label={'Shoreline Types'}>
      {subtypeData?.shoreline_types?.map((st) => (
        <div className="group-wrap" key={st.shoreline_type}>
          <TextInput label={'Shoreline type'} value={st?.shoreline_type} />
          <TextInput label={'Percent Covered'} value={st?.percent_covered} />
        </div>
      ))}
    </Fieldset>
    <MechTreatmentInfo entries={subtypeData?.entries} />
  </>
);

export default AquaticMechTreatment;
