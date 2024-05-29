import React from 'react';
import './Footer.css';
import sunriseLogo from './bcGovSunriseLogo.png';
import { useSelector } from 'react-redux';

export const Footer: React.FC = () => {
  const hasBetaAccess = useSelector((state: any) => state?.Auth?.v2BetaAccess);
  const links = [
    { label: 'Copyright', url: 'https://www2.gov.bc.ca/gov/content/home/copyright ' },
    { label: 'Disclaimer', url: 'https://www2.gov.bc.ca/gov/content/home/disclaimer ' },
    { label: 'Privacy Statement', url: 'https://www2.gov.bc.ca/gov/content/home/privacy' },
    { label: 'Accessibility', url: 'https://www2.gov.bc.ca/gov/content/home/accessible-government' }
  ];

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
          }}
        >
          <option value={'v2'}>v2</option>
          <option value={'v1'}>v1</option>
        </select>
      ) : (
        <> </>
      )}
      <img
        alt="bcLogo"
        src={sunriseLogo}
        width="60px"
        style={{ objectFit: 'cover', cursor: 'pointer' }}
        height="28px"
      />
      {links.map((link) => {
        return (
          <a className={'footerLinks'} key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        );
      })}
    </div>
  );
};
