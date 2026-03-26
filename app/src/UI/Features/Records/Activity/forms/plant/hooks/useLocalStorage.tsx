const useLocalStorage = (key: string) => {
  const confirm = (): void => localStorage.setItem(key, 'true');
  const decline = (): void => localStorage.setItem(key, 'false');
  const get = (): string | null => localStorage.getItem(key);
  const set = (val: string): void => localStorage.setItem(key, val);
  const remove = (): void => localStorage.removeItem(key);

  /**
   * @desc Cast localStorage value to boolean from string.
   * @param key localStorage Key
   */
  const getConfirmation = (): boolean => {
    const bool = localStorage.getItem(key);
    if (bool === 'true') return true;
    if (bool === 'false') return false;
    return false;
  };

  return { get, set, confirm, decline, getConfirmation, remove };
};

export default useLocalStorage;
