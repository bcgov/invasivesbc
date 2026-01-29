import logo from './logo.svg';

type PropTypes = {
  className?: string;
};
const Logo = ({ className }: PropTypes) => <img src={logo} className={className} />;

export default Logo;
