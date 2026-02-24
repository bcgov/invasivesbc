import { Delete } from '@mui/icons-material';
import './deleteControl.css';
import { useFormContext } from 'react-hook-form';

const DeleteControl = ({ onClick }) => {
  const {
    formState: { disabled }
  } = useFormContext();
  return (
    <div className="delete-control">
      <button disabled={disabled} onClick={onClick}>
        {<Delete color="error" />}
      </button>
    </div>
  );
};

export default DeleteControl;
