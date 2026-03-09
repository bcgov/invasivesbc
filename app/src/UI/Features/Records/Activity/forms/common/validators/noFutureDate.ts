const noFutureDate = (value: string) => {
  try {
    const incoming = new Date(value);
    const today = new Date();
    return incoming <= today || 'Date cannot occur in the future';
  } catch {
    return 'Invalid Date';
  }
};

export default noFutureDate;
