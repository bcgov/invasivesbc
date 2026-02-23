const maxValue = (val: number | string, max: number) => {
  if (typeof val === 'string') {
    return val.length <= max || `Maximum ${max} characters allowed.`;
  }
  return val <= max || `Value cannot be greater than ${max}`;
};

export default maxValue;
