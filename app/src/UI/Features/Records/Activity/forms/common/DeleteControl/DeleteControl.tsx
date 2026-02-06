import { Delete } from '@mui/icons-material';
import './deleteControl.css';

const DeleteControl = ({ onClick }) => (
  <div className="delete-control">
    <button onClick={onClick}>{<Delete color="error" />}</button>
  </div>
);

export default DeleteControl;
