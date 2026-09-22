import './recordMetadata.css';
import Fieldset from '../Fieldset/Fieldset';
import { FormSchema } from '../../plant/interfaces';
import { ActivitySubtypesShortLabels } from 'sharedAPI';
import ChangeHistory from '../ChangeHistory/ChangeHistory';
import { ReactNode } from 'react';
import { useSelector } from 'utils/use_selector';
import moment from 'moment';

type InfoProps = {
  term: string;
  definition?: string | number | ReactNode;
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
  const metadata = useSelector((state) => state.ActivityPage.formMetadata);

  return (
    <Fieldset label={'Overview'}>
      <div className="metadata-wrapper">
        <dl id="record-metadata">
          <Info term={'Record ID'} definition={formState?.short_id} />
          <Info term={'Form Status'} definition={formState?.form_status} />
          <Info term={'Activity Type'} definition={formState?.type} />
          <Info term={'Activity Subtype'} definition={ActivitySubtypesShortLabels[formState?.subtype]} />
          <Info term={'Date of Activity'} definition={formState?.date} />
          <Info term={'Created By'} definition={formState?.created_by} />
          {metadata?.created_date && (
            <Info term={'Created At'} definition={moment(metadata?.created_date).format('YYYY-MM-DD')} />
          )}
          <Info term={'Batch ID'} definition={metadata?.batch_id} />
          <Info term={'Invasive Plant'} definition={metadata?.plants} />
          <Info term={'Positive Plant'} definition={metadata?.positive_plants} />
          <Info term={'Negative Plant'} definition={metadata?.negative_plants} />
          <Info term={'Record History'} definition={<ChangeHistory />} />
        </dl>
      </div>
    </Fieldset>
  );
};
export default RecordMetadata;
