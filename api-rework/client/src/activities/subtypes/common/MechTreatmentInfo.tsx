import Fieldset from 'common-components/inputs/Fieldset';
import TextInput from 'common-components/inputs/TextInput';

const MechTreatmentInfo = ({ treatmentInfo }) => (
  <Fieldset label={'Mechanical Treatment Info'}>
    {treatmentInfo?.map((ti) => (
      <div className="group-wrap">
        <TextInput label={'Invasive Plant'} value={ti?.invasive_plant} />
        <TextInput label={'Treated Area (m2)'} value={ti?.treated_area_msq} />
        <TextInput label={'Mechanical Method'} value={ti?.mechanical_method} />
        <TextInput label={'Disposal Method'} value={ti?.disposal_method} />
        <TextInput label={'Disposed Material Format'} value={ti?.disposed_material_format} />
        <TextInput label={'Disposed Material Amount'} value={ti?.disposed_material_amount} />
      </div>
    ))}
  </Fieldset>
);

export default MechTreatmentInfo;
