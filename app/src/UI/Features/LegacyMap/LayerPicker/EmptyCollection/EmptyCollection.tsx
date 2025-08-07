import './emptyCollection.css';

type PropTypes = {
  text: string;
};

const EmptyCollection = ({ text }: PropTypes) => (
  <div className="lp-empty-collection">
    <p>{text}</p>
  </div>
);

export default EmptyCollection;
