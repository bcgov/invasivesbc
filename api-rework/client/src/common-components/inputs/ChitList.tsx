interface KeyValue {
  code: string;
  full: string | number;
}
type PropTypes = {
  items: Array<string> | Array<KeyValue>;
};
/**
 * Mock MultiSelect Chit input
 */
const ChitList = ({ items }: PropTypes) => {
  const isStr = typeof items?.[0] === 'string';

  return (
    <div className="chit-list">
      {items?.map((i) => (
        <span key={i} className="chit">
          {isStr ? i : `${i.full} (${i.code})`}
        </span>
      ))}
    </div>
  );
};

export default ChitList;
