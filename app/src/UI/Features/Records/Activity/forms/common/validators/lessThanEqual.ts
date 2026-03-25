const lessThanEqual = (val: number | string | undefined, max: number) => {
  if (val == undefined) return true;
  if (typeof val === 'string') {
    return val.length <= max || `Maximum ${max} characters allowed.`;
  }
  return val <= max || `Value cannot be greater than ${max}`;
};

export default lessThanEqual;
