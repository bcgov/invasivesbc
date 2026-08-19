import { BugReport } from '@mui/icons-material';
import Button from 'UI/Reusable/Button/Button';
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
      <Button onClick={onClick} style={buttonStyle}>
        <BugReport /> {label}
      </Button>
    </Debug>
  );
};

export default DebugButton;
