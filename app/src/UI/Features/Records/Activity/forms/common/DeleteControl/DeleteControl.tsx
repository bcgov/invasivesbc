import { Delete } from '@mui/icons-material';
import './deleteControl.css';
import { useFormContext } from 'react-hook-form';

type PropTypes = {
  label?: string;
  onClick: () => void;
};
const DeleteControl = ({ onClick, label }: PropTypes) => {
  const {
    formState: { disabled }
  } = useFormContext();
  return (
    <div className="delete-control">
      <button disabled={disabled} onClick={onClick}>
        <Delete color="error" /> {label && <span>Remove Entry</span>}
      </button>
    </div>
  );
};

export default DeleteControl;
