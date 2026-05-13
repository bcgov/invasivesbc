const maxArrayLength = (val: Array<unknown>, max: number): boolean | string => {
  return val?.length <= max || `Maximum ${max} entries are allowed.`;
};

export default maxArrayLength;
