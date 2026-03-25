import { Delete } from '@mui/icons-material';
import './deleteControl.css';
import { useFormContext } from 'react-hook-form';

type PropTypes = {
  onClick: () => void;
};
const DeleteControl = ({ onClick }: PropTypes) => {
  const {
    formState: { disabled }
  } = useFormContext();
  return (
    <div className="delete-control">
      <button disabled={disabled} onClick={onClick}>
        <Delete color="error" /> <span>Remove Entry</span>
      </button>
    </div>
  );
};

export default DeleteControl;
