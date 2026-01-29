import { KeyValue } from 'constants';

const stringify = (val: string | KeyValue) => {
  if (val == undefined) return 'NO DATA';

  if (typeof val === 'string' || typeof val === 'number') {
    return val;
  }
  return `${val.full} (${val.code})`;
};

export { stringify };
