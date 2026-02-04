const noFutureDate = (value: string) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    return value <= today || 'Date cannot occur in the future';
  } catch {
    return 'Invalid Date';
  }
};

export default noFutureDate;
