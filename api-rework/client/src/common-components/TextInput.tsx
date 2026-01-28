import { useState } from 'react';

interface PropTypes {
  label?: string;
  value: string;
}

const TextInput = ({ label, value }: PropTypes) => {
  const [id] = useState<string>(Math.random().toString());
  return (
    <div className="contained">
      {label && <label htmlFor={id}>{label ?? 'N/A'}</label>}
      <input id={id} type="text" value={value ?? 'N/A'} readOnly></input>
    </div>
  );
};

export default TextInput;
