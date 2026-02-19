import { BugReport } from '@mui/icons-material';
import { Debug } from 'UI/Reusable/Predicates/Debug';

const DebugButton = ({ onClick, label }) => {
  return (
    <div className="control">
      <Debug>
        <button onClick={onClick}>
          <BugReport /> {label}
        </button>
      </Debug>
    </div>
  );
};

export default DebugButton;
