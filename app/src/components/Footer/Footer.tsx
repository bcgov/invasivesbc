import React from 'react';
import { Link, Toolbar } from '@material-ui/core';

function Footer() {
  return (
    <div className="App-footer">
      <Toolbar>
        <Link href="https://www.gov.bc.ca/gov/content/home/disclaimer">Disclaimer</Link>
        <Link href="https://www.gov.bc.ca/gov/content/home/privacy">Privacy</Link>
        <Link href="https://www.gov.bc.ca/gov/content/home/accessible-government">Accessibility</Link>
        <Link href="https://www.gov.bc.ca/gov/content/home/copyright">Copyright</Link>
      </Toolbar>
    </div>
  );
}

export default Footer;
