import Fieldset from 'common-components/inputs/Fieldset';
import TextInput from 'common-components/inputs/TextInput';

const MicrositeConditions = ({ microsite_conditions }) => {
  return (
    <Fieldset label={'microsite conditions'}>
      <TextInput label={'site surface shape'} value={microsite_conditions?.site_surface_shape} />
      <TextInput label={'mesoslope position'} value={microsite_conditions?.mesoslope_position} />
    </Fieldset>
  );
};
export default MicrositeConditions;
