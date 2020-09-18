import './Header.scss';

import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';

const Header = () => {
  return (
    <AppBar position="relative" className="App-header">
      <Toolbar>
        <h1>Invasives BC 3</h1>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
