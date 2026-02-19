import { useFormContext } from 'react-hook-form';
import { FormSchema } from '../plant/interfaces';
import { Debug } from 'UI/Reusable/Predicates/Debug';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { BugReport } from '@mui/icons-material';

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
        <pre style={style}>{JSON.stringify(formData, null, 2)}</pre>
      </Accordion>
    </Debug>
  );
};

export default DebugFormData;
