import { useSelector } from 'utils/use_selector';
import './recordMetadata.css';
import Fieldset from '../Fieldset/Fieldset';

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

const RecordMetadata = () => {
  const formState = useSelector((state) => state.ActivityPage?.formState);
  return (
    <Fieldset label={'Activity Metadata'}>
      <dl id="record-metadata">
        <Info term={'ID'} definition={formState?.short_id} />
        <Info term={'Status'} definition={formState?.form_status} />
        <Info term={'Activity Type'} definition={formState?.type} />
        <Info term={'Activity Subtype'} definition={formState?.subtype} />
        <Info
          term={'Date'}
          definition={formState?.date ? new Date(formState?.date)?.toLocaleDateString() : undefined}
        />
        <Info term={'Created By'} definition={formState?.created_by} />
      </dl>
    </Fieldset>
  );
};
export default RecordMetadata;
