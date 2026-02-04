const checkSum = (entries: any[], expected: number, key?: string): boolean | string => {
  const total = entries.reduce((sum, curr) => {
    const rawValue = key ? curr?.[key] : curr;
    return sum + (Number(rawValue) || 0);
  }, 0);

  return total === expected || `Sum must equal ${expected} (current: ${total})`;
};

export default checkSum;
