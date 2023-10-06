import React from 'react';
import './Footer.css';
import { useSelector } from 'react-redux';

export const Footer: React.FC = () => {
  const hasBetaAccess = useSelector((state: any) => state?.Auth?.v2BetaAccess);
  return (
    <div className="FooterBar">
      {hasBetaAccess ? (
        <select
          className="versionSelect"
          value={'v2'}
          onChange={(e) => {
            console.dir(e);
            if (e.target?.value === 'v2') {
              //do nothing
            } else {
              window.location.href = 'https://invasivesbc.gov.bc.ca';
            }
          }}>
          <option value={'v2'}>v2</option>
          <option value={'v1'}>v1</option>
        </select>
      ) : (
        <> </>
      )}
    </div>
  );
};
