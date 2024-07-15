import React from 'react';
import './Footer.css';
import sunriseLogo from './bcGovSunriseLogo.png';
import { INFORMATIONAL_LINKS } from 'constants/links';

export const Footer: React.FC = () => {
  return (
    <div className="FooterBar">
      <img
        alt="bcLogo"
        src={sunriseLogo}
        style={{ objectFit: 'cover', cursor: 'pointer' }}
      />
      {INFORMATIONAL_LINKS.map((link) => {
        return (
          <a className={'footerLinks'} key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        );
      })}
    </div>
  );
};
