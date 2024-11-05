import React from 'react';
import './Footer.css';
import sunriseLogo from './bcGovSunriseLogo.png';
import { INFORMATIONAL_LINKS } from 'constants/links';

export const Footer: React.FC = () => {
  return (
    <footer className="FooterBar">
      <img alt="bcLogo" src={sunriseLogo} />
      {INFORMATIONAL_LINKS.map((link) => {
        return (
          <a className={'footerLinks'} key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        );
      })}
    </footer>
  );
};
