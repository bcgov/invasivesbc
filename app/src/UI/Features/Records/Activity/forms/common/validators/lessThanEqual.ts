const lessThanEqual = (val: number | string | undefined | null, max: number) => {
  if (val == undefined || Number.isNaN(val)) return true;
  if (typeof val === 'string') {
    return val.length <= max || `Maximum ${max} characters allowed. (${val.length}/${max})`;
  }
  return val <= max || `Value cannot be greater than ${max}`;
};

export default lessThanEqual;
