/**
 * @desc Compare dates (Day-Month-Year) excluding time for match
 * @param date1 First date
 * @param date2 second date
 * @returns Dates are the same
 */
const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() === d2.getTime();
};

export default isSameDay;
