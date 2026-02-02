import Fieldset from 'common-components/inputs/Fieldset';
import TextInput from 'common-components/inputs/TextInput';

interface WellInfo {
  well_tag_number: number;
  distance: number;
}
type PropTypes = {
  data: Array<WellInfo>;
};
const NearestWells = ({ data }: PropTypes) => {
  return (
    <Fieldset label={'Nearest Wells'}>
      {!data || (data?.length === 0 && <TextInput value={'No Wells in Area'} />)}
      {data?.map((w) => (
        <div className="group-wrap">
          <TextInput label={'well_tag_number'} value={w?.well_tag_number} />
          <TextInput label={'distance'} value={w?.distance} />
        </div>
      ))}
    </Fieldset>
  );
};
export default NearestWells;
