import { Check, Edit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { MouseEvent, ReactNode, useState } from 'react';

type PropTypes = {
  name: string;
  recordsetKey: string;
  isDefaultRecordset: boolean;
  handleNameChange: (val: string, recordsetKey: string) => void;
  children?: ReactNode;
  recordSetType: RecordSetType;
};
const RecordSetDetails = ({
  name,
  isDefaultRecordset,
  handleNameChange,
  recordsetKey,
  recordSetType,
  children
}: PropTypes) => {
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
        <p>{name || `New Recordset - ${recordSetType}`}</p>
      )}
      <IconButton color="primary" onClick={toggleEdit}>
        {isEditing ? <Check /> : <Edit />}
      </IconButton>
    </div>
  );
};

export default RecordSetDetails;
