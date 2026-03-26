const useLocalStorage = (key: string) => {
  const confirm = (): void => localStorage.setItem(key, 'true');
  const decline = (): void => localStorage.setItem(key, 'false');
  const get = (): string | null => localStorage.getItem(key);
  const set = (val: string): void => localStorage.setItem(key, val);

  return { get, set, confirm, decline };
};

export default useLocalStorage;
