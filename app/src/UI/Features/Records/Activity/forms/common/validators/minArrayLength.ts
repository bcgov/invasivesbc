const minArrayLength = (val: Array<unknown>, min: number): boolean | string => {
  return val?.length >= min || `Minimum ${min} entry is required`;
};

export default minArrayLength;
