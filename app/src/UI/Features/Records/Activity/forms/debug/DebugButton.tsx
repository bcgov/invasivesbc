import { BugReport } from '@mui/icons-material';
import Button, { InputButtonProps } from 'UI/Reusable/Button/Button';
import { Debug } from 'UI/Reusable/Predicates/Debug';

const DebugButton = ({ children, ...props }: InputButtonProps) => (
  <Debug>
    <Button {...props}>
      <BugReport /> {children}
    </Button>
  </Debug>
);

export default DebugButton;
