import { KeyValue } from 'constants';
import { stringify } from 'utils';

type PropTypes = {
  items: Array<string> | Array<KeyValue>;
};
/**
 * Mock MultiSelect Chit input
 */
const ChitList = ({ items }: PropTypes) => {
  const isEmpty = !items || items.length === 0;
  return (
    <div className={`chit-list ${isEmpty ? 'warning' : ''}`}>
      {items?.length === 0 && 'NO DATA'}
      {items?.map((i) => (
        <span key={i} className="chit">
          {stringify(i)}
        </span>
      ))}
    </div>
  );
};

export default ChitList;
