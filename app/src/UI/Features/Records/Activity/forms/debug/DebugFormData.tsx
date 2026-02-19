import { useFormContext } from 'react-hook-form';
import { FormSchema } from '../plant/interfaces';
import { Debug } from 'UI/Reusable/Predicates/Debug';
import Accordion from 'UI/Reusable/Accordion/Accordion';
import { BugReport } from '@mui/icons-material';

const DebugFormData = () => {
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
        <pre style={{ display: 'flex', textWrap: 'wrap' }}>{JSON.stringify(formData, null, 2)}</pre>
      </Accordion>
    </Debug>
  );
};

export default DebugFormData;
