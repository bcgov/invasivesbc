import React from 'react';
import './Spinner.css';

const Spinner: React.FC = () => {
  return (
    <svg viewBox="0 0 50 50" className="spinner">
      <circle
        cx="25"
        cy="25"
        r="20"
        className="path"
        fill="none"
        stroke="rgba(0,0,0,0.7)"
        strokeWidth="3"
        strokeLinecap="round"
      ></circle>
    </svg>
  );
};

export default Spinner;
