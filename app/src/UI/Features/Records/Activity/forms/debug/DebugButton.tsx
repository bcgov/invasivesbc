import { BugReport } from '@mui/icons-material';
import { Debug } from 'UI/Reusable/Predicates/Debug';

const DebugButton = ({ onClick, label }) => {
  const buttonStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bc-blue)',
    color: 'white',
    height: '3rem',
    fontSize: '1rem'
  };
  return (
    <Debug>
      <button onClick={onClick} style={buttonStyle}>
        <BugReport /> {label}
      </button>
    </Debug>
  );
};

export default DebugButton;
