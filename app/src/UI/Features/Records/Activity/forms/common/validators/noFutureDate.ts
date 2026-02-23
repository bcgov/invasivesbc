const noFutureDate = (value: Date) => {
  try {
    const today = new Date();
    return value <= today || 'Date cannot occur in the future';
  } catch {
    return 'Invalid Date';
  }
};

export default noFutureDate;
