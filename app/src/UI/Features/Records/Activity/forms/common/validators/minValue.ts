const minValue = (val: number | string, min: number) => {
  if (typeof val === 'string') {
    return val.length >= min || `Enter at least ${min} characters.`;
  }
  return val >= min || `Value cannot be less than ${min}`;
};

export default minValue;
