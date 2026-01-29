import Logo from 'common-components/logo/Logo';
import './header.css';

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
      {authenticated ? <button onClick={handleLogout}>Logout</button> : <button onClick={handleLogin}>Login</button>}
    </header>
  );
};

export default Header;
