import ChitList from 'common-components/inputs/ChitList';
import Fieldset from 'common-components/inputs/Fieldset';
import TextInput from 'common-components/inputs/TextInput';

type MonitoringInfo = {
  comment: string;
  evidence_of_treatment: string;
  invasive_plant_aquatic?: string;
  invasive_plant?: string;
  invasive_plants_on_site: Array<string>;
  management_efficacy_rating: string;
  treatment_efficacy_rating: string;
  treatment_pass: string;
};

type PropTypes = {
  data: MonitoringInfo;
};

const MonitoringInfo = ({ data }: PropTypes) => {
  return (
    <div className="group-wrap">
      <TextInput label={'Terrestrial Invasive Plant'} value={data?.invasive_plant} />
      <TextInput label={'aquatic invasive plant'} value={data?.invasive_plant_aquatic} />
      <TextInput label={'Evidence of Treatment'} value={data?.evidence_of_treatment} />
      <TextInput label={'treatment efficacy rating'} value={data?.treatment_efficacy_rating} />
      <TextInput label={'management efficacy rating'} value={data?.management_efficacy_rating} />
      <Fieldset small label="Invasive plants on site">
        <ChitList items={data?.invasive_plants_on_site} />
      </Fieldset>
      <TextInput label={'Treatment Pass'} value={data?.treatment_pass} />
      <TextInput label={'Comment'} value={data?.comment} />
    </div>
  );
};

export default MonitoringInfo;
