import './advisoryMessage.css';

type PropTypes = {
  text: string;
};

const AdvisoryMessage = ({ text }: PropTypes) => {
  return <span className="form-advisory">{text}</span>;
};

export default AdvisoryMessage;
