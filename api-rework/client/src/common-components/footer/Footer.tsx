import sunriseLogo from './bcGovSunriseLogo.png';
import './footer.css';

const INFORMATIONAL_LINKS = [
  { label: 'Copyright', url: 'https://www2.gov.bc.ca/gov/content/home/copyright ' },
  { label: 'Disclaimer', url: 'https://www2.gov.bc.ca/gov/content/home/disclaimer ' },
  { label: 'Privacy Statement', url: 'https://www2.gov.bc.ca/gov/content/home/privacy' },
  { label: 'Accessibility', url: 'https://www2.gov.bc.ca/gov/content/home/accessible-government' }
];

const Footer = () => {
  return (
    <footer className="FooterBar">
      <img alt="bcLogo" src={sunriseLogo} />
      <nav>
        {INFORMATIONAL_LINKS.map((link) => (
          <a className={'footerLinks'} key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
