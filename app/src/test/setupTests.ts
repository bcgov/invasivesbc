if (typeof window?.URL?.createObjectURL === 'undefined') {
  (window as any).URL.createObjectURL = () => {
    // Do nothing
    // Mock this function for mapbox-gl to work
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  // Silence MUI Warnings and Errors caused by using JSDom
  vi.spyOn(console, 'warn').mockImplementation((msg) => {
    if (typeof msg === 'string' && msg.startsWith('MUI:')) {
      return '';
    }
    return msg;
  });
  vi.spyOn(console, 'error').mockImplementation((msg) => {
    if (typeof msg === 'string' && msg.startsWith('MUI:')) {
      return '';
    }
    return msg;
  });
});
