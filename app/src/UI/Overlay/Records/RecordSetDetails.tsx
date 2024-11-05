import { Check, Edit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { MouseEvent, ReactNode, useState } from 'react';

type PropTypes = {
  name: string;
  recordsetKey: string;
  isDefaultRecordset: boolean;
  handleNameChange: (val: string, recordsetKey: string) => void;
  children?: ReactNode;
};
const RecordSetDetails = ({ name, isDefaultRecordset, handleNameChange, recordsetKey, children }: PropTypes) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const toggleEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsEditing((prev) => !prev);
  };
  if (isDefaultRecordset) {
    return (
      <div className="record-set-details">
        {children}
        <p>{name}</p>
      </div>
    );
  }
  return (
    <div className="record-set-details">
      {children}
      {isEditing ? (
        <input
          type="text"
          value={name}
          onChange={(evt) => handleNameChange(evt.target.value, recordsetKey)}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <p>{name}</p>
      )}
      <IconButton color="primary" onClick={toggleEdit}>
        {isEditing ? <Check /> : <Edit />}
      </IconButton>
    </div>
  );
};

export default RecordSetDetails;
