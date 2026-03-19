const greaterThan = (val: number | string | undefined, min: number) => {
  if (val == undefined) return true;
  if (typeof val === 'string') {
    return val.length > min || `Enter at least ${min} characters.`;
  }
  return val > min || `Value cannot be less than ${min}`;
};

export default greaterThan;
