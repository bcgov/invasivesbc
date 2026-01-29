import { KeyValue } from 'constants';
import { useState } from 'react';
import { stringify } from 'utils';

interface PropTypes {
  label?: string;
  value: string | KeyValue;
}

const TextInput = ({ label, value }: PropTypes) => {
  const isEmpty = !value;
  const [id] = useState<string>(Math.random().toString());

  return (
    <div className="contained">
      {label && <label htmlFor={id}>{label ?? 'N/A'}</label>}
      <input id={id} type="text" className={`${isEmpty ? 'warning' : ''}`} value={stringify(value)} readOnly></input>
    </div>
  );
};

export default TextInput;
