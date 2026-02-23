import { Delete } from '@mui/icons-material';
import './deleteControl.css';

const DeleteControl = ({ onClick, disabled }) => (
  <div className="delete-control">
    <button disabled={disabled} onClick={onClick}>
      {<Delete color="error" />}
    </button>
  </div>
);

export default DeleteControl;
