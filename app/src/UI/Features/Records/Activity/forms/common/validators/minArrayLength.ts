const minArrayLength = (val: Array<unknown>, min: number): boolean | string => {
  return val?.length >= min || `Minimum ${min} required`;
};

export default minArrayLength;
