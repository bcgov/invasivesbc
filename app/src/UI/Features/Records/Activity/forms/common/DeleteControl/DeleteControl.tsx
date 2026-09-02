import { Delete } from '@mui/icons-material';
import './deleteControl.css';
import { useFormContext } from 'react-hook-form';
import Button from 'UI/Reusable/Button/Button';

type PropTypes = {
  onClick: () => void;
};
const DeleteControl = ({ onClick }: PropTypes) => {
  const {
    formState: { disabled }
  } = useFormContext();

  if (disabled) return null;
  return (
    <div className="delete-control">
      <Button disabled={disabled} onClick={onClick}>
        <Delete color="error" /> <span>Remove Entry</span>
      </Button>
    </div>
  );
};

export default DeleteControl;
