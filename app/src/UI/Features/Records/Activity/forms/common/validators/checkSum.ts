const checkSum = (entries: any[], expected: number, options?: { key: string; readable: string }): boolean | string => {
  const total = entries.reduce((sum, curr) => {
    const rawValue = options?.key ? curr?.[options.key] : curr;
    return sum + (Number(rawValue) || 0);
  }, 0);

  if (total === expected) return true;
  if (options) return `Sum of ${options.readable} must equal ${expected} (current: ${total})`;
  return `Sum must equal ${expected} (current: ${total})`;
};

export default checkSum;
