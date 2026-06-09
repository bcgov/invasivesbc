import { useFormContext } from 'react-hook-form';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { Debug } from 'UI/Reusable/Predicates/Debug';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { BugReport } from '@mui/icons-material';
import { CopyToClipboardButton } from 'UI/Features/Batch/batch-upload/ClipboardHelper';

const DebugFormData = () => {
  const style: React.CSSProperties = {
    display: 'flex',
    textWrap: 'wrap',
    width: '100%',
    backgroundColor: 'lightgray',
    border: '1px solid black',
    padding: '1rem',
    boxSizing: 'border-box',
    textAlign: 'left'
  };
  const { watch } = useFormContext<FormSchema>();
  const formData = watch();

  return (
    <Debug>
      <Accordion
        title={
          <>
            <BugReport />
            Form State (JSON)
          </>
        }
      >
        <CopyToClipboardButton content={JSON.stringify(formData)} /> Copy JSON to Clipboard
        <pre style={style}>
          {/* Truncate any Encoded media Files to avoid massive print outs  */}
          {JSON.stringify(
            formData,
            (key, value) => {
              if (key === 'encoded_file' && value) {
                return value.slice(0, 25) + '... [Truncated]';
              }
              return value;
            },
            2
          )}
        </pre>
      </Accordion>
    </Debug>
  );
};

export default DebugFormData;
