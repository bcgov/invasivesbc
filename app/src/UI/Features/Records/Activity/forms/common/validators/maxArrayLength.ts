const maxArrayLength = (val: Array<unknown>, max: number, error_msg?: string): boolean | string => {
  return val?.length <= max || (error_msg ?? `Maximum ${max} entries are allowed.`);
};

export default maxArrayLength;
