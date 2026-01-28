const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

interface SubtypeData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subtypeData: Record<PropertyKey, any>;
}

export type { SubtypeData };
export { API_URL };
