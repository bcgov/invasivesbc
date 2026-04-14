const greaterThan = (val: number | string | undefined, min: number) => {
  if (val == undefined || Number.isNaN(val)) return true;
  if (typeof val === 'string') {
    return val.length > min || `Enter at least ${min} characters.`;
  }
  return val > min || `Value must be greater than ${min}`;
};

export default greaterThan;
