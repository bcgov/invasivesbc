import { useState } from 'react';

interface PropTypes {
  label?: string;
  value: string;
}

const TextField = ({ label, value }: PropTypes) => {
  const [id] = useState<string>(Math.random().toString());
  return (
    <div className="contained">
      {label && <label htmlFor={id}>{label}</label>}
      <textarea id={id} rows={5} value={value} readOnly></textarea>
    </div>
  );
};

export default TextField;
