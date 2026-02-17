import './recordMetadata.css';
import Fieldset from '../Fieldset/Fieldset';
import { FormSchema } from '../../plant/interfaces';

type InfoProps = {
  term: string;
  definition?: string | number;
};
const Info = ({ term, definition }: InfoProps) => {
  if (!definition) return;
  return (
    <div className="list-item">
      <dt>{term}</dt>
      <dd>{definition}</dd>
    </div>
  );
};

type PropTypes = {
  formState: FormSchema;
};
const RecordMetadata = ({ formState }: PropTypes) => {
  return (
    <Fieldset label={'Activity Metadata'}>
      <dl id="record-metadata">
        <Info term={'ID'} definition={formState?.short_id} />
        <Info term={'Status'} definition={formState?.form_status} />
        <Info term={'Activity Type'} definition={formState?.type} />
        <Info term={'Activity Subtype'} definition={formState?.subtype} />
        <Info term={'Date'} definition={new Date(formState?.date)?.toLocaleDateString() ?? ''} />
        <Info term={'Created By'} definition={formState?.created_by} />
      </dl>
    </Fieldset>
  );
};
export default RecordMetadata;
