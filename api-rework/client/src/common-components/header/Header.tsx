import Logo from 'common-components/logo/Logo';
import './header.css';
import {NavLink} from "react-router";

type PropTypes = {
  authenticated: boolean;
  handleLogout: () => void;
  handleLogin: () => void;
};
const Header = ({ authenticated, handleLogout, handleLogin }: PropTypes) => {
  return (
    <header>
      <Logo />
      <h1>Invasives BC</h1>
      {authenticated && <NavLink to={'/activities'}>Activities List</NavLink> }
      {authenticated && <NavLink to={'/migration-status'}>Failed Migrations</NavLink> }
      {authenticated ? <button onClick={handleLogout}>Logout</button> : <button onClick={handleLogin}>Login</button>}
    </header>
  );
};

export default Header;
